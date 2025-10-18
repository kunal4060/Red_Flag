// Register listener for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.action !== "analyzeLink" || !message?.link) {
    console.log("Invalid action or missing link");
    sendResponse({ success: false, error: "Invalid action or missing link" });
    return false;
  }

  (async () => {
    try {
      console.log("Analyzing link:", message.link);
      // call backend AI endpoint (no VirusTotal interaction)
      const resp = await fetch("http://localhost:5001/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: message.link }),
      });

      console.log("Backend response status:", resp.status);
      
      if (!resp.ok) {
        const errorMsg = `Backend error: ${resp.status} ${resp.statusText}`;
        console.log(errorMsg);
        sendResponse({ success: false, error: errorMsg });
        return;
      }

      const data = await resp.json();
      console.log("Backend response data:", data);

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
            console.log("Notification error:", e);
            // ignore notification errors
          }
        }

        sendResponse({ success: true, ai });
      } else {
        const errorMsg = data?.message || "AI analysis failed";
        console.log("Analysis failed:", errorMsg);
        sendResponse({ success: false, error: errorMsg });
      }
    } catch (err) {
      console.error("background analyzeLink error:", err);
      sendResponse({ success: false, error: String(err) });
    }
  })();

  return true; // keep message channel open
});