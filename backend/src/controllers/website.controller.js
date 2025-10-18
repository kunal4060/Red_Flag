import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const analyzeWebsite = (req, res) => {
  try {
    // Log the request body for debugging
    console.log("Request body:", req.body);
    
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: "url required" });
    }

    // Path to the website_analysis.py script
    const scriptPath = path.resolve(__dirname, "..", "..", "website_analysis.py");
    
    // Check if the script exists
    if (!fs.existsSync(scriptPath)) {
      return res.status(500).json({ 
        success: false, 
        message: "Analysis script not found",
        error: `Script not found at ${scriptPath}. Please ensure the RedFlag project is properly set up.`
      });
    }
    
    // Spawn Python process with the script
    const py = spawn("python", [scriptPath, "--url", url], {
      cwd: path.resolve(__dirname, "..", "..")
    });

    let stdout = "";
    let stderr = "";

    py.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    
    py.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    py.on("close", (code) => {
      // Log output for debugging
      console.log("Python script output - stdout:", stdout);
      console.log("Python script output - stderr:", stderr);
      console.log("Python script exit code:", code);
      
      if (code !== 0) {
        console.log("Sending error response due to non-zero exit code");
        return res.status(500).json({ 
          success: false, 
          message: "Python script error", 
          error: stderr || stdout 
        });
      }

      try {
        // The script outputs JSON, so we parse it
        const cleanStdout = stdout.trim();
        console.log("Attempting to parse JSON:", cleanStdout);
        const parsed = JSON.parse(cleanStdout);
        console.log("Successfully parsed JSON, sending response");
        return res.status(200).json({ success: true, data: parsed });
      } catch (err) {
        console.log("Failed to parse JSON:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to parse Python output", 
          error: err.toString(),
          raw: stdout
        });
      }
    });

    py.on("error", (err) => {
      console.log("Python process error:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Python process failed", 
        error: err.toString() 
      });
    });

  } catch (err) {
    console.error("analyzeWebsite error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};