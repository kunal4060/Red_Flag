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



  return (
    <div className="bg-black border-2 border-red-600 p-4 w-80 flex flex-col items-center text-white">
      <div className="flex flex-row justify-between items-center w-full mb-4">
        <div className="font[ariellslds] text-2xl">RedFlag</div>
        <FaShareFromSquare size={20}/>
      </div>
      <div className="border-2 border-neutral-400 rounded-lg w-full mx-4 h-40"></div>
      <button className="bg-white text-black rounded-full px-4 py-2 mt-4" onClick={handleCheck}>Run AI Analysis</button>
      <button className="bg-white text-black rounded-full px-4 py-2 mt-4" onClick={handleCheck2}>Run Deep Analysis</button>
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