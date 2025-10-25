import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from "fs";
import aiService from "../services/ai.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const analyzeWebsite = async (req, res) => {
  try {
    // Log the request body for debugging
    console.log("Request body:", req.body);
    
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: "url required" });
    }

    // Path to the fetch_links.py script
    const fetchScriptPath = path.resolve(__dirname, "..", "..", "..", "AI", "fetch_links.py");
    
    // Check if the script exists
    if (!fs.existsSync(fetchScriptPath)) {
      return res.status(500).json({ 
        success: false, 
        message: "Fetch links script not found",
        error: `Script not found at ${fetchScriptPath}`
      });
    }
    
    // Fetch links from the website
    const fetchLinks = () => {
      return new Promise((resolve, reject) => {
        const py = spawn("python", [fetchScriptPath, url], {
          cwd: path.resolve(__dirname, "..", "..", "..")
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
          if (code !== 0) {
            reject(new Error(stderr || "Failed to fetch links"));
          } else {
            try {
              const parsed = JSON.parse(stdout.trim());
              resolve(parsed);
            } catch (err) {
              reject(new Error("Failed to parse fetch links output"));
            }
          }
        });

        py.on("error", (err) => {
          reject(err);
        });
      });
    };

    // Fetch the links
    console.log("Fetching links from:", url);
    const linksData = await fetchLinks();
    console.log(`Found ${linksData.count} links`);

    if (!linksData.links || linksData.links.length === 0) {
      return res.status(200).json({ 
        success: true, 
        data: {
          input_url: url,
          total_links: 0,
          links_analyzed: 0,
          results: []
        }
      });
    }

    // Analyze each link with the AI service
    console.log("Analyzing links with AI service...");
    const results = await aiService.predictBatch(linksData.links);
    console.log("Analysis complete");

    // Format the response
    const response = {
      input_url: url,
      total_links: linksData.count,
      links_analyzed: results.length,
      results: results
    };

    return res.status(200).json({ success: true, data: response });

  } catch (err) {
    console.error("analyzeWebsite error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error",
      error: err.message
    });
  }
};

export const fetchLinks = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false,
        message: "url required" 
      });
    }

    // Path to the fetch_links.py script
    const fetchScriptPath = path.resolve(__dirname, "..", "..", "..", "AI", "fetch_links.py");
    
    // Check if the script exists
    if (!fs.existsSync(fetchScriptPath)) {
      return res.status(500).json({ 
        success: false, 
        message: "Fetch links script not found",
        error: `Script not found at ${fetchScriptPath}`
      });
    }
    
    // Fetch links from the website
    const fetchLinksProcess = () => {
      return new Promise((resolve, reject) => {
        const py = spawn("python", [fetchScriptPath, url], {
          cwd: path.resolve(__dirname, "..", "..", "..")
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
          if (code !== 0) {
            reject(new Error(stderr || "Failed to fetch links"));
          } else {
            try {
              const parsed = JSON.parse(stdout.trim());
              resolve(parsed);
            } catch (err) {
              reject(new Error("Failed to parse fetch links output"));
            }
          }
        });

        py.on("error", (err) => {
          reject(err);
        });
      });
    };

    // Fetch the links
    console.log("Fetching links from:", url);
    const linksData = await fetchLinksProcess();
    console.log(`Found ${linksData.count} links`);

    return res.status(200).json({ 
      success: true, 
      links: linksData.links || [],
      count: linksData.count || 0
    });

  } catch (err) {
    console.error("fetchLinks error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error",
      error: err.message
    });
  }
};