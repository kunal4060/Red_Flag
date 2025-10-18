// ...existing code...
import { useState } from "react";
import { FaShareFromSquare } from "react-icons/fa6";

function Popup() {
  const [status, setStatus] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [unsafeList, setUnsafeList] = useState([]);
  const [safeList, setSafeList] = useState([]);

  const handleCheck = async () => {
    setStatus("🔍 Reading clipboard...");
    setAiResult(null);
    setUnsafeList([]);
    setSafeList([]);
    try {
      const link = await navigator.clipboard.readText();
      if (!link) {
        setStatus("Clipboard is empty");
        return;
      }

      setStatus("🔍 Sending to analysis service...");
      
      // Add timeout to prevent indefinite waiting
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const responsePromise = new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "analyzeLink", link }, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });

      const response = await Promise.race([responsePromise, timeout]);

      if (response?.success && response.ai) {
        // response.ai comes from backend python wrapper: response.ai.ai_result expected
        const ai = response.ai.ai_result || response.ai;
        setAiResult(ai);
        setStatus("✅ AI analysis complete");
        // optional: if background returned unsafe/safe lists (VT earlier), set them
        if (response.unsafeSources) setUnsafeList(response.unsafeSources);
        if (response.safeSources) setSafeList(response.safeSources);
      } else {
        setStatus("❌ Analysis failed: " + (response?.error || "unknown error"));
      }
    } catch (err) {
      console.error("Error in handleCheck:", err);
      if (err.message === 'Request timeout') {
        setStatus("❌ Request timed out. Is the backend running?");
      } else {
        setStatus("❌ Error: " + err.message);
      }
    }
  };

  return (
    <div className="bg-black border-2 border-red-600 p-4 w-80 flex flex-col items-center text-white">
      <div className="flex flex-row justify-between items-center w-full mb-4">
        <div className="font[ariellslds] text-2xl">RedFlag</div>
        <FaShareFromSquare size={20}/>
      </div>
      <div className="border-2 border-neutral-400 rounded-lg w-full mx-4 h-40"></div>
      <button className="bg-white text-black rounded-full px-4 py-2 mt-4" onClick={handleCheck}>Analyze Copied Link</button>
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
    </div>
  );
}

export default Popup;
// ...existing code...