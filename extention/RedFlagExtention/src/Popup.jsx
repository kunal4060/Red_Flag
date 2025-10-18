/* global chrome */
// ...existing code...
import { useState } from "react";
import { FaShareFromSquare } from "react-icons/fa6";

function Popup() {
  const [status, setStatus] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [unsafeList, setUnsafeList] = useState([]);
  const [safeList, setSafeList] = useState([]);
  const [websiteAnalysis, setWebsiteAnalysis] = useState(null);

  const handleCheck = async () => {
  setStatus("🔍 Reading clipboard...");
  setAiResult(null);
  setUnsafeList([]);
  setSafeList([]);
  setWebsiteAnalysis(null);
  try {
    const link = await navigator.clipboard.readText();
    if (!link) {
      setStatus("Clipboard is empty");
      return;
    }

    setStatus("🔍 Running AI analysis...");

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), 10000)
    );

    const responsePromise = new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "analyzeLinkAI", link }, (response) => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve(response);
      });
    });

    const response = await Promise.race([responsePromise, timeout]);

    if (response?.success && response.ai) {
      const ai = response.ai?.ai_result || response.ai;
      setAiResult(ai);
      setStatus("✅ AI analysis complete");
    } else {
      setStatus("❌ AI analysis failed: " + (response?.error || "unknown error"));
    }
  } catch (err) {
    console.error("Error in handleCheck:", err);
    setStatus("❌ Error: " + err.message);
  }
};


  const handleCheck2 = async () => {
  setStatus("🔍 Reading clipboard for VirusTotal scan...");
  setAiResult(null);
  setUnsafeList([]);
  setSafeList([]);
  setWebsiteAnalysis(null);
  try {
    const link = await navigator.clipboard.readText();
    if (!link) {
      setStatus("Clipboard is empty");
      return;
    }

    setStatus("🔍 Running VirusTotal scan...");

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), 15000)
    );

    const responsePromise = new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: "analyzeLinkVT", link }, (response) => {
        resolve(response);
      });
    });

    const response = await Promise.race([responsePromise, timeout]);

    if (response?.success) {
      if (response.unsafeSources) setUnsafeList(response.unsafeSources);
      if (response.safeSources) setSafeList(response.safeSources);
      setStatus("✅ VirusTotal scan complete");
    } else {
      setStatus("❌ VirusTotal scan failed: " + (response?.error || "unknown error"));
    }
  } catch (err) {
    console.error("Error in handleCheck2:", err);
    setStatus("❌ Error: " + err.message);
  }
};

  const handleInsightAnalysis = async () => {
    setStatus("🔍 Starting Insight Analysis...");
    setAiResult(null);
    setUnsafeList([]);
    setSafeList([]);
    setWebsiteAnalysis(null);
    
    try {
      setStatus("🔍 Analyzing current website...");
      
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 30000)
      );

      const responsePromise = new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "analyzeWebsite" }, (response) => {
          resolve(response);
        });
      });

      const response = await Promise.race([responsePromise, timeout]);

      if (response?.success && response.websiteData) {
        setWebsiteAnalysis(response.websiteData.data);
        setStatus("✅ Insight Analysis complete");
      } else {
        setStatus("❌ Insight Analysis failed: " + (response?.error || "unknown error"));
      }
    } catch (err) {
      console.error("Error in handleInsightAnalysis:", err);
      setStatus("❌ Error: " + err.message);
    }
  };

  return (
    <div className="bg-black border-2 border-red-600 p-4 w-80 flex flex-col items-center text-white">
      <div className="flex flex-row justify-between items-center w-full mb-4">
        <div className="font[ariellslds] text-2xl">RedFlag</div>
        <FaShareFromSquare size={20}/>
      </div>
      <div className="border-2 border-neutral-400 rounded-lg w-full mx-4 h-40"></div>
      <button className="bg-white text-black rounded-full px-4 py-2 mt-4" onClick={handleCheck}>Run AI Analysis</button>
      <button className="bg-white text-black rounded-full px-4 py-2 mt-4" onClick={handleCheck2}>Run Deep Analysis</button>
      <button className="bg-red-600 text-white rounded-full px-4 py-2 mt-4" onClick={handleInsightAnalysis}>Insight Analysis</button>
      <p>{status}</p>

      {aiResult && (
        <div style={{ textAlign: "left", marginTop: 8 }}>
          <strong>AI result:</strong>
          <div>Label: {aiResult.label ?? aiResult}</div>
          {typeof aiResult.score === "number" && <div>Score: {aiResult.score.toFixed(4)}</div>}
        </div>
      )}

      {unsafeList.length > 0 && (
        <div style={{ textAlign: "left", marginTop: 8 }}>
          <strong>Unsafe / Flagged engines ({unsafeList.length}):</strong>
          <ul>
            {unsafeList.map((s, idx) => (
              <li key={idx}>
                {s.engine_name} — {s.category} {s.result ? `(${s.result})` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      {safeList.length > 0 && (
        <div style={{ textAlign: "left", marginTop: 8 }}>
          <strong>Safe / Unflagged engines ({safeList.length}):</strong>
          <ul>
            {safeList.map((s, idx) => (
              <li key={idx}>
                {s.engine_name} — {s.category} {s.result ? `(${s.result})` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {websiteAnalysis && (
        <div style={{ textAlign: "left", marginTop: 8, width: "100%" }}>
          <strong>Insight Analysis Results:</strong>
          <div>Total Links Found: {websiteAnalysis.total_links}</div>
          <div>Links Analyzed: {websiteAnalysis.links_analyzed}</div>
          <div>Malicious Links: {websiteAnalysis.results.filter(r => r.analysis.ai_result?.label === "malicious").length}</div>
          <div>Benign Links: {websiteAnalysis.results.filter(r => r.analysis.ai_result?.label === "benign").length}</div>
          
          <div style={{ maxHeight: "200px", overflowY: "auto", marginTop: "8px" }}>
            <strong>Detailed Results:</strong>
            {websiteAnalysis.results.map((result, idx) => (
              <div key={idx} style={{ 
                padding: "4px", 
                margin: "2px 0", 
                backgroundColor: result.analysis.ai_result?.label === "malicious" ? "rgba(255,0,0,0.2)" : "rgba(0,255,0,0.1)",
                borderRadius: "4px"
              }}>
                <div style={{ 
                  fontWeight: "bold", 
                  color: result.analysis.ai_result?.label === "malicious" ? "red" : "green"
                }}>
                  {result.analysis.ai_result?.label || "Unknown"} ({(result.analysis.ai_result?.score || 0).toFixed(4)})
                </div>
                <div style={{ fontSize: "0.8em", wordBreak: "break-all" }}>{result.url}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Popup;
// ...existing code...