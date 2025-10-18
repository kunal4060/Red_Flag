import { spawn } from "child_process";
import path from "path";

export const analyzeUrl = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: "url required" });

    const scriptPath = path.resolve(process.cwd(), "AI", "run_inference.py");

    // spawn Python with shell:true for Windows path spaces
    const py = spawn(`python "${scriptPath}" --url "${url}"`, {
      shell: true,
      cwd: path.dirname(scriptPath),
    });

    let stdout = "";
    let stderr = "";

    py.stdout.on("data", (data) => { stdout += data.toString(); });
    py.stderr.on("data", (data) => { stderr += data.toString(); });

    let responded = false; // ensure only one response is sent

    const sendError = (message, extra) => {
      if (!responded) {
        responded = true;
        return res.status(500).json({ success: false, message, ...extra });
      }
    };

    py.on("close", (code) => {
      const cleanStdout = stdout.trim();

      if (code !== 0) {
        return sendError("Python script error", { error: stderr || cleanStdout });
      }

      try {
        const parsed = JSON.parse(cleanStdout);
        if (!responded) responded = true;
        return res.status(200).json({ success: true, ai: parsed });
      } catch (err) {
        return sendError("Python output parse error", { raw: cleanStdout, error: err.toString() });
      }
    });

    py.on("error", (err) => {
      return sendError("Python process failed", { error: err.toString() });
    });

  } catch (err) {
    console.error("analyzeUrl error:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
