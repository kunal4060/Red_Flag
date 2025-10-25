import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class KaggleService {
  constructor() {
    this.ready = false;
    this.startService();
  }

  startService() {
    console.log("🚀 Starting Kaggle phishing detection service...");
    this.ready = true;
    console.log("✅ Kaggle service ready");
  }

  async predictBatch(urls) {
    if (!this.ready) {
      throw new Error("Kaggle service not ready");
    }

    return new Promise((resolve, reject) => {
      const servicePath = path.resolve(__dirname, "..", "..", "AI", "kaggle_phishing_service.py");
      
      const py = spawn("python", [servicePath], {
        cwd: path.resolve(__dirname, "..", "..", "..")
      });

      let stdout = "";
      let stderr = "";

      // Send URLs as JSON to stdin
      py.stdin.write(JSON.stringify({ urls }));
      py.stdin.end();

      py.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      py.stderr.on("data", (data) => {
        stderr += data.toString();
        console.log("Kaggle service:", data.toString());
      });

      py.on("close", (code) => {
        if (code !== 0) {
          console.error("Kaggle service error:", stderr);
          reject(new Error(stderr || "Kaggle service failed"));
        } else {
          try {
            const results = JSON.parse(stdout.trim());
            resolve(results);
          } catch (err) {
            console.error("Failed to parse Kaggle output:", stdout);
            reject(new Error("Failed to parse Kaggle output"));
          }
        }
      });

      py.on("error", (err) => {
        reject(err);
      });
    });
  }

  isReady() {
    return this.ready;
  }
}

// Singleton instance
const kaggleService = new KaggleService();

export default kaggleService;
