import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * AI Inference Service Manager
 * Maintains a persistent Python process with the AI model loaded
 */
class AIServiceManager {
  constructor() {
    this.pythonProcess = null;
    this.isReady = false;
    this.queue = [];
    this.currentCallback = null;
    this.buffer = "";
  }

  /**
   * Initialize the AI service by loading the model
   */
  async initialize() {
    return new Promise((resolve, reject) => {
      try {
        const servicePath = path.resolve(__dirname, "..", "..", "AI", "inference_service.py");
        
        // Start Python process in interactive mode
        this.pythonProcess = spawn("python", ["-u", servicePath, "--interactive"], {
          cwd: path.resolve(__dirname, "..", ".."),
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let errorBuffer = "";

        const initTimeout = setTimeout(() => {
          reject(new Error("AI service initialization timeout"));
        }, 30000);

        this.pythonProcess.stderr.on('data', (data) => {
          const message = data.toString();
          errorBuffer += message;
          console.log("[AI Service stderr]:", message);
          
          // Check if service is ready
          if (message.includes("Ready for requests") || message.includes("Model loaded successfully")) {
            clearTimeout(initTimeout);
            this.isReady = true;
            console.log("[AI Service] Initialized and ready");
            resolve();
          }
        });

        this.pythonProcess.stdout.on('data', (data) => {
          this.buffer += data.toString();
          this._processBuffer();
        });

        this.pythonProcess.on('error', (err) => {
          console.error("[AI Service] Process error:", err);
          clearTimeout(initTimeout);
          reject(err);
        });

        this.pythonProcess.on('close', (code) => {
          console.log(`[AI Service] Process exited with code ${code}`);
          this.isReady = false;
        });

      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Process the output buffer for JSON responses
   */
  _processBuffer() {
    const lines = this.buffer.split('\n');
    
    // Keep the last incomplete line in the buffer
    this.buffer = lines.pop() || "";
    
    for (const line of lines) {
      if (line.trim() && this.currentCallback) {
        try {
          const result = JSON.parse(line);
          const callback = this.currentCallback;
          this.currentCallback = null;
          callback(null, result);
          
          // Process next item in queue
          this._processQueue();
        } catch (err) {
          console.error("[AI Service] JSON parse error:", err, "Line:", line);
        }
      }
    }
  }

  /**
   * Process the next item in the queue
   */
  _processQueue() {
    if (this.queue.length > 0 && !this.currentCallback) {
      const { url, callback } = this.queue.shift();
      this._sendRequest(url, callback);
    }
  }

  /**
   * Send a request to the Python process
   */
  _sendRequest(url, callback) {
    this.currentCallback = callback;
    const request = JSON.stringify({ url }) + '\n';
    this.pythonProcess.stdin.write(request);
  }

  /**
   * Predict a single URL
   */
  async predict(url) {
    return new Promise((resolve, reject) => {
      if (!this.isReady) {
        return reject(new Error("AI service not ready"));
      }

      const callback = (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      };

      // Add to queue
      this.queue.push({ url, callback });
      
      // Process queue if not currently processing
      if (!this.currentCallback) {
        this._processQueue();
      }
    });
  }

  /**
   * Predict multiple URLs
   */
  async predictBatch(urls) {
    const results = [];
    for (const url of urls) {
      try {
        const result = await this.predict(url);
        results.push({ url, analysis: result });
      } catch (err) {
        results.push({ url, error: err.message });
      }
    }
    return results;
  }

  /**
   * Shutdown the service
   */
  shutdown() {
    if (this.pythonProcess) {
      this.pythonProcess.kill();
      this.pythonProcess = null;
      this.isReady = false;
    }
  }
}

// Create singleton instance
const aiService = new AIServiceManager();

export default aiService;
