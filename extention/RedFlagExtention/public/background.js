/* global chrome */
const VIRUSTOTAL_API_KEY = "9928b748ed404fc609a72a720e67252bfd7a2fd604a0e8585754ef9a9a6980af"; 
const VT_BASE_URL = "https://www.virustotal.com/api/v3/urls";

// helper — VirusTotal requires URL-safe Base64 encoding
function encodeUrlForVT(url) {
  const base64 = btoa(url);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ---------------------- VirusTotal Scan ----------------------
async function scanWithVirusTotal(link) {
  try {
    const encoded = encodeUrlForVT(link);
    const res = await fetch(`${VT_BASE_URL}/${encoded}`, {
      method: "GET",
      headers: {
        "accept": "application/json",
        "x-apikey": VIRUSTOTAL_API_KEY.trim(),
      },
    });

    if (res.status === 401) throw new Error("Unauthorized (401): Invalid or missing VirusTotal API key.");

    if (res.status === 404) {
      // URL not found — submit for scan
      const postRes = await fetch(VT_BASE_URL, {
        method: "POST",
        headers: {
          "x-apikey": VIRUSTOTAL_API_KEY.trim(),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `url=${encodeURIComponent(link)}`,
      });

      const postData = await postRes.json();
      if (!postRes.ok) throw new Error(`VT submission failed: ${postRes.status} ${postRes.statusText}`);
      return { submitted: true, vt: postData };
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`VT HTTP ${res.status} ${res.statusText}: ${errText}`);
    }

    const data = await res.json();
    const results = data.data?.attributes?.last_analysis_results || {};

    const unsafe = [];
    const safe = [];
    for (const [engine, r] of Object.entries(results)) {
      if (r.category === "malicious" || r.category === "suspicious") unsafe.push({ engine_name: engine, category: r.category, result: r.result });
      else safe.push({ engine_name: engine, category: r.category, result: r.result });
    }

    return { vt: data, unsafeSources: unsafe, safeSources: safe };
  } catch (err) {
    console.error("❌ VirusTotal scan error:", err);
    return { error: err.message };
  }
}

// ---------------------- AI Analysis ----------------------
async function analyzeWithAI(link) {
  const resp = await fetch("http://localhost:5001/api/ai/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: link }),
  });

  if (!resp.ok) throw new Error(`Backend error: ${resp.status} ${resp.statusText}`);
  const data = await resp.json();
  return data;
}

// ---------------------- Website Analysis ----------------------
async function analyzeWebsite(url) {
  try {
    // First, we need to fetch links from the website
    // For this extension, we'll make a request to our backend API
    // which has the link fetching and analysis capability
    const resp = await fetch("http://localhost:5001/api/website/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url }),
    });

    if (!resp.ok) {
      // If our backend API is not available, we'll return a specific error
      if (resp.status === 404) {
        throw new Error("Website analysis API not available. Please ensure the RedFlag backend is running.");
      }
      throw new Error(`Backend error: ${resp.status} ${resp.statusText}`);
    }
    
    const data = await resp.json();
    return data;
  } catch (err) {
    console.error("❌ Website analysis error:", err);
    return { error: err.message };
  }
}

// ---------------------- Main Listener ----------------------
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message?.action) {
    sendResponse({ success: false, error: "Missing action" });
    return false;
  }

  if (message.action === "analyzeLinkAI") {
    // AI analysis only
    if (!message.link) {
      sendResponse({ success: false, error: "Missing link for AI analysis" });
      return false;
    }
    
    (async () => {
      try {
        const link = message.link; // Extract link from message
        const aiData = await analyzeWithAI(link);
        sendResponse({ success: true, ai: aiData.ai });
      } catch (err) {
        sendResponse({ success: false, error: String(err) });
      }
    })();
    return true;
  }

  if (message.action === "analyzeLinkVT") {
    // VirusTotal scan only
    if (!message.link) {
      sendResponse({ success: false, error: "Missing link for VT analysis" });
      return false;
    }
    
    (async () => {
      try {
        const link = message.link; // Extract link from message
        const vtResult = await scanWithVirusTotal(link);
        if (vtResult.error) {
          sendResponse({ success: false, error: vtResult.error });
        } else {
          sendResponse({
            success: true,
            unsafeSources: vtResult.unsafeSources,
            safeSources: vtResult.safeSources,
          });
        }
      } catch (err) {
        sendResponse({ success: false, error: String(err) });
      }
    })();
    return true;
  }

  if (message.action === "analyzeWebsite") {
    // Website analysis
    (async () => {
      try {
        // Get the current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url) {
          sendResponse({ success: false, error: "No active tab found" });
          return;
        }
        
        const websiteData = await analyzeWebsite(tab.url);
        if (websiteData.error) {
          sendResponse({ success: false, error: websiteData.error });
        } else {
          sendResponse({
            success: true,
            websiteData: websiteData
          });
        }
      } catch (err) {
        sendResponse({ success: false, error: String(err) });
      }
    })();
    return true;
  }

  sendResponse({ success: false, error: "Invalid action" });
});