import { spawn } from "child_process";
import path from "path";

export const analyzeUrl = async (req, res) => {
  try {
    const { url } = req.body;
    console.log("Received request to analyze URL:", url);
    
    if (!url) {
      console.log("URL is missing in request");
      return res.status(400).json({ message: "url required" });
    }

    const scriptPath = path.resolve(process.cwd(), "AI", "run_inference.py");
    console.log("Script path:", scriptPath);

    // spawn Python with shell:true for Windows path spaces
    const py = spawn(`python3 "${scriptPath}" --url "${url}"`, {
      shell: true,
      cwd: path.dirname(scriptPath),
    });

    let stdout = "";
    let stderr = "";

    py.stdout.on("data", (data) => { 
      stdout += data.toString();
      console.log("Python stdout:", data.toString());
    });
    
    py.stderr.on("data", (data) => { 
      stderr += data.toString();
      console.log("Python stderr:", data.toString());
    });

    let responded = false; // ensure only one response is sent

    const sendError = (message, extra) => {
      if (!responded) {
        responded = true;
        console.log("Sending error response:", message);
        return res.status(500).json({ success: false, message, ...extra });
      }
    };

    py.on("close", (code) => {
      console.log("Python process closed with code:", code);
      const cleanStdout = stdout.trim();
      console.log("Clean stdout:", cleanStdout);
      console.log("Stderr:", stderr);

      if (code !== 0) {
        console.log("Python script exited with error code");
        return sendError("Python script error", { error: stderr || cleanStdout });
      }

      try {
        const parsed = JSON.parse(cleanStdout);
        console.log("Parsed Python output:", parsed);
        if (!responded) {
          responded = true;
          console.log("Sending successful response");
          return res.status(200).json({ success: true, ai: parsed });
        }
      } catch (err) {
        console.log("Failed to parse Python output:", err);
        return sendError("Python output parse error", { raw: cleanStdout, error: err.toString() });
      }
    });

    py.on("error", (err) => {
      console.log("Python process error:", err);
      return sendError("Python process failed", { error: err.toString() });
    });

  } catch (err) {
    console.error("analyzeUrl error:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};