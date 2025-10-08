import { useState } from "react";
import "./popup.css";

function Popup() {
  const [status, setStatus] = useState("");

  const handleCheck = () => {
    setStatus("🔍 Analyzing link...");
    chrome.runtime.sendMessage({ action: "analyzeClipboard" });
    setTimeout(() => setStatus("✅ Done (check notification)"), 2000);
  };

  return (
    <div className="popup-container">
      <h3>🔗 Link Analyzer</h3>
      <button onClick={handleCheck}>Check Copied Link</button>
      <p>{status}</p>
    </div>
  );
}

export default Popup;
