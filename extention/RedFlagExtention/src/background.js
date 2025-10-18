// ...existing code...
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.action !== "analyzeLink" || !message?.link) {
    sendResponse({ success: false, error: "Invalid action or missing link" });
    return false;
  }

  (async () => {
    try {
      // call backend AI endpoint (no VirusTotal interaction)
      const resp = await fetch("http://localhost:5001/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: message.link }),
      });

      const data = await resp.json();

      if (data?.success && data?.ai) {
        const ai = data.ai;
        // notify user with AI result summary
        const label = ai.ai_result?.label || "unknown";
        const score = typeof ai.ai_result?.score === "number" ? ai.ai_result.score : null;
        const notifMessage = `${message.link}\nAI: ${label}${score !== null ? ` (${score.toFixed(3)})` : ""}`;

        if (chrome.notifications && chrome.notifications.create) {
          try {
            chrome.notifications.create({
              type: "basic",
              iconUrl: "icon.png",
              title: "AI Link Analysis",
              message: notifMessage,
            });
          } catch (e) {
            // ignore notification errors
          }
        }

        sendResponse({ success: true, ai });
      } else {
        sendResponse({ success: false, error: data?.message || "AI analysis failed" });
      }
    } catch (err) {
      console.error("background analyzeLink error:", err);
      sendResponse({ success: false, error: String(err) });
    }
  })();

  return true; // keep message channel open
});
// ...existing code...