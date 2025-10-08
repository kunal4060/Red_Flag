async function getCopiedText() {
  try {
    const text = await navigator.clipboard.readText();
    return text;
  } catch (err) {
    console.error("Clipboard access denied:", err);
    return null;
  }
}

async function analyzeLink(link) {
  const apiKey = "YOUR_VIRUSTOTAL_API_KEY"; // Replace this
  const encodedUrl = btoa(link).replace(/=+$/, "");

  try {
    const response = await fetch(`https://www.virustotal.com/api/v3/urls/${encodedUrl}`, {
      headers: { "x-apikey": apiKey },
    });

    if (!response.ok) throw new Error("API error");
    const data = await response.json();

    const stats = data.data.attributes.last_analysis_stats;
    const malicious = stats.malicious;
    const suspicious = stats.suspicious;

    let result = "✅ Safe";
    if (malicious > 0) result = `⚠️ Malicious (${malicious} engines)`;
    else if (suspicious > 0) result = `⚠️ Suspicious`;

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Link Scan Result",
      message: `${link}\n${result}`,
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.action === "analyzeClipboard") {
    const text = await getCopiedText();
    if (text && text.startsWith("http")) await analyzeLink(text);
    else {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "No Link Found",
        message: "Clipboard doesn't contain a valid URL.",
      });
    }
  }
});
