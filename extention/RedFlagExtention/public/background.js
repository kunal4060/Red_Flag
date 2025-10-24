/* global chrome */
const VIRUSTOTAL_API_KEY = "9928b748ed404fc609a72a720e67252bfd7a2fd604a0e8585754ef9a9a6980af"; 
const VT_BASE_URL = "https://www.virustotal.com/api/v3/urls";
const BACKEND_URL = "http://localhost:5001";

// Helper to get auth token from storage
async function getAuthToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['authToken'], (result) => {
      resolve(result.authToken || null);
    });
  });
}

// Helper to get user profile
async function getUserProfile() {
  const token = await getAuthToken();
  if (!token) return null;
  
  try {
    const resp = await fetch(`${BACKEND_URL}/api/auth/check`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!resp.ok) {
      // Token might be invalid, clear it
      chrome.storage.local.remove(['authToken']);
      return null;
    }
    
    return await resp.json();
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return null;
  }
}

// Helper to consume a token
async function consumeToken() {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  
  const resp = await fetch(`${BACKEND_URL}/api/auth/consume-token`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  if (!resp.ok) {
    const error = await resp.json();
    throw new Error(error.message || "Failed to consume token");
  }
  
  return await resp.json();
}

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
  const token = await getAuthToken();
  const headers = { "Content-Type": "application/json" };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const resp = await fetch(`${BACKEND_URL}/api/ai/analyze`, {
    method: "POST",
    headers,
    body: JSON.stringify({ url: link }),
  });

  if (!resp.ok) throw new Error(`Backend error: ${resp.status} ${resp.statusText}`);
  const data = await resp.json();
  return data;
}

// ---------------------- Website Analysis ----------------------
async function analyzeWebsite(url) {
  try {
    const token = await getAuthToken();
    const headers = { "Content-Type": "application/json" };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    // First, we need to fetch links from the website
    // For this extension, we'll make a request to our backend API
    // which has the link fetching and analysis capability
    const resp = await fetch(`${BACKEND_URL}/api/website/analyze`, {
      method: "POST",
      headers,
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

// ---------------------- Track tabs for analysis ----------------------
let analyzingTabs = new Set(); // Track which tabs are currently being analyzed
let tabCreationTime = new Map(); // tabId -> creation timestamp
let blockedUrls = new Map(); // tabId -> original URL that was blocked
let allowedNavigations = new Set(); // Track URLs that user has approved to navigate to

// ---------------------- Track when tabs are created ----------------------
chrome.tabs.onCreated.addListener((tab) => {
  tabCreationTime.set(tab.id, Date.now());
  console.log('🛡️ RedFlag Background: Tab created:', tab.id);
  // Clean up old entries after 2 seconds
  setTimeout(() => {
    if (!blockedUrls.has(tab.id)) {
      tabCreationTime.delete(tab.id);
    }
  }, 2000);
});

// ---------------------- Intercept ONLY specific navigations ----------------------
chrome.webNavigation.onBeforeNavigate.addListener(
  (details) => {  // Changed from async to sync
    // Only intercept main frame navigations
    if (details.frameId !== 0) return;
    
    const tabId = details.tabId;
    const url = details.url;
    
    // Skip internal Chrome pages
    if (url.startsWith('chrome://') || 
        url.startsWith('chrome-extension://') || 
        url.startsWith('about:') ||
        url === 'about:blank') {
      return;
    }
    
    // Skip if this URL has been approved by user
    if (allowedNavigations.has(url)) {
      console.log('🛡️ RedFlag Background: URL approved, allowing:', url);
      allowedNavigations.delete(url); // Remove after use
      return;
    }
    
    // Skip if already analyzing this tab
    if (analyzingTabs.has(tabId)) {
      console.log('🛡️ RedFlag Background: Already analyzing tab', tabId);
      return;
    }
    
    const transitionType = details.transitionType;
    const transitionQualifiers = details.transitionQualifiers || [];
    
    console.log('🛡️ RedFlag Background: Navigation detected:', { 
      tabId, 
      url, 
      transitionType,
      transitionQualifiers
    });
    
    // Determine if this should be intercepted
    const shouldIntercept = (
      transitionType === 'typed' ||  // Typed in address bar
      transitionType === 'auto_bookmark' ||  // Bookmark click
      transitionType === 'generated' ||  // Auto-generated
      transitionType === 'keyword' ||  // Search keyword
      transitionType === 'keyword_generated'  // Search result
    );
    
    // DO NOT intercept:
    // - 'link' transitions (these are handled by content script)
    // - 'reload' transitions
    // - 'form_submit' transitions
    // - Redirects
    if (transitionType === 'link' || 
        transitionType === 'reload' || 
        transitionType === 'form_submit' ||
        transitionQualifiers.includes('client_redirect') ||
        transitionQualifiers.includes('server_redirect')) {
      console.log('🛡️ RedFlag Background: Skipping', transitionType, 'transition');
      return;
    }
    
    if (!shouldIntercept) {
      console.log('🛡️ RedFlag Background: Not intercepting transition type:', transitionType);
      return;
    }
    
    console.log('🛡️ RedFlag Background: ✅ INTERCEPTING navigation!');
    
    analyzingTabs.add(tabId);
    blockedUrls.set(tabId, url);
    
    // IMMEDIATELY stop the navigation by updating to about:blank
    // This must be synchronous to prevent the original navigation
    chrome.tabs.update(tabId, { url: 'about:blank' }, () => {
      // After redirecting to blank, perform analysis
      performTabAnalysis(tabId, url);
    });
  },
  { url: [{ schemes: ['http', 'https'] }] }
);

// ---------------------- Perform analysis on a tab ----------------------
async function performTabAnalysis(tabId, targetUrl) {
  try {
    console.log('🛡️ RedFlag Background: Starting analysis for tab', tabId, 'URL:', targetUrl);
    
    // Wait for about:blank to load (already redirected in the listener)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Inject loading screen
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (targetUrl) => {
        document.body.style.cssText = 'margin: 0; padding: 0; background: #000;';
        document.body.innerHTML = `
          <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          ">
            <div style="text-align: center; color: white;">
              <div style="font-size: 64px; margin-bottom: 20px;">🛡️</div>
              <h2 style="color: #ef4444; font-size: 28px; font-weight: bold; margin-bottom: 10px;">RedFlag Security Check</h2>
              <p style="color: #9ca3af; font-size: 16px; margin-bottom: 20px;">Analyzing link safety...</p>
              <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; margin: 20px auto; max-width: 500px; word-break: break-all;">
                <p style="color: #6b7280; font-size: 12px; margin-bottom: 8px;">Target URL:</p>
                <p style="color: #fff; font-size: 14px;">${targetUrl}</p>
              </div>
              <div style="margin-top: 30px;">
                <svg style="width: 48px; height: 48px; animation: spin 1s linear infinite; margin: 0 auto;" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2" fill="none" stroke-dasharray="31.4" stroke-dashoffset="10" />
                </svg>
              </div>
            </div>
          </div>
          <style>
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          </style>
        `;
      },
      args: [targetUrl]
    });
    
    // Analyze the URL
    const analysisResult = await analyzeWebsite(targetUrl);
    
    // Show results in the tab
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (url, result) => {
        const data = result.websiteData || result;
        const results = data.results || [];
        const maliciousCount = results.filter(r => r.analysis?.ai_result?.label === "malicious").length;
        const benignCount = results.filter(r => r.analysis?.ai_result?.label === "benign").length;
        const isSafe = maliciousCount === 0;
        const riskColor = isSafe ? '#10b981' : maliciousCount < 3 ? '#f59e0b' : '#ef4444';
        const hasError = result.error || !result.websiteData;
        
        document.body.innerHTML = `
          <div style="
            min-height: 100vh;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 100%);
            padding: 40px 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          ">
            <div style="max-width: 700px; margin: 0 auto;">
              ${hasError ? `
                <div style="text-align: center; margin-bottom: 40px;">
                  <div style="font-size: 80px; margin-bottom: 16px;">❌</div>
                  <h1 style="color: #ef4444; font-size: 32px; font-weight: bold; margin-bottom: 12px;">
                    Analysis Failed
                  </h1>
                  <p style="color: #9ca3af; font-size: 16px; margin-bottom: 20px;">
                    ${result.error || 'Unable to analyze this website'}
                  </p>
                </div>
              ` : `
                <div style="text-align: center; margin-bottom: 40px;">
                  <div style="font-size: 80px; margin-bottom: 16px;">${isSafe ? '✅' : '⚠️'}</div>
                  <h1 style="color: ${riskColor}; font-size: 32px; font-weight: bold; margin-bottom: 12px;">
                    ${isSafe ? 'Safe to Proceed' : 'Potential Risk Detected'}
                  </h1>
                  <div style="display: inline-block; background: ${riskColor}20; border: 2px solid ${riskColor}; border-radius: 25px; padding: 10px 24px;">
                    <span style="color: ${riskColor}; font-size: 14px; font-weight: 600;">
                      Risk Level: ${maliciousCount === 0 ? 'Low' : maliciousCount < 3 ? 'Medium' : 'High'}
                    </span>
                  </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 30px;">
                  <div style="background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 12px; padding: 24px; text-align: center;">
                    <div style="color: #3b82f6; font-size: 36px; font-weight: bold;">${data.total_links || 0}</div>
                    <div style="color: #9ca3af; font-size: 13px; margin-top: 8px;">Links Found</div>
                  </div>
                  <div style="background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 12px; padding: 24px; text-align: center;">
                    <div style="color: #a855f7; font-size: 36px; font-weight: bold;">${data.links_analyzed || 0}</div>
                    <div style="color: #9ca3af; font-size: 13px; margin-top: 8px;">Analyzed</div>
                  </div>
                  <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 12px; padding: 24px; text-align: center;">
                    <div style="color: #ef4444; font-size: 36px; font-weight: bold;">${maliciousCount}</div>
                    <div style="color: #9ca3af; font-size: 13px; margin-top: 8px;">Malicious</div>
                  </div>
                  <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 12px; padding: 24px; text-align: center;">
                    <div style="color: #10b981; font-size: 36px; font-weight: bold;">${benignCount}</div>
                    <div style="color: #9ca3af; font-size: 13px; margin-top: 8px;">Benign</div>
                  </div>
                </div>
              `}
              
              <div style="background: rgba(0,0,0,0.5); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <p style="color: #9ca3af; font-size: 13px; margin-bottom: 10px;">Target URL:</p>
                <p style="color: #fff; font-size: 15px; word-break: break-all;">${url}</p>
              </div>
              
              <div style="display: flex; gap: 16px; margin-top: 40px;">
                <button onclick="window.close()" style="
                  flex: 1;
                  background: #374151;
                  color: white;
                  border: none;
                  border-radius: 12px;
                  padding: 18px;
                  font-size: 16px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.2s;
                " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#374151'">
                  ✖️ Close Tab
                </button>
                <button onclick="(function(){ 
                  chrome.runtime.sendMessage({ action: 'allowNavigation', url: '${url}', tabId: ${tabId} }, function(response) {
                    if (response && response.success) {
                      setTimeout(function() { window.location.href='${url}'; }, 100);
                    }
                  });
                })()" style="
                  flex: 1;
                  background: ${hasError ? '#6b7280' : (isSafe ? '#10b981' : '#ef4444')};
                  color: white;
                  border: none;
                  border-radius: 12px;
                  padding: 18px;
                  font-size: 16px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.2s;
                " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                  ${hasError ? '➡️ Proceed Anyway' : (isSafe ? '✓ Proceed Safely' : '⚠️ Proceed Anyway')}
                </button>
              </div>
              
              <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 24px;">
                Powered by RedFlag AI Security
              </p>
            </div>
          </div>
        `;
      },
      args: [targetUrl, analysisResult]
    });
    
  } catch (err) {
    console.error('🛡️ RedFlag Background: Error intercepting tab:', err);
    // If there's an error, allow navigation to proceed
    try {
      await chrome.tabs.update(tabId, { url: blockedUrls.get(tabId) });
    } catch (e) {
      console.error('🛡️ RedFlag Background: Error restoring navigation:', e);
    }
  } finally {
    analyzingTabs.delete(tabId);
    tabCreationTime.delete(tabId);
    blockedUrls.delete(tabId);
  }
}

// ---------------------- Main Listener ----------------------
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message?.action) {
    sendResponse({ success: false, error: "Missing action" });
    return false;
  }

  // Handle login action
  if (message.action === "login") {
    (async () => {
      try {
        const { email, password } = message;
        const resp = await fetch(`${BACKEND_URL}/api/auth/extension-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        
        if (!resp.ok) {
          const error = await resp.json();
          sendResponse({ success: false, error: error.message });
          return;
        }
        
        const data = await resp.json();
        // Store token in chrome storage
        chrome.storage.local.set({ authToken: data.token });
        sendResponse({ success: true, user: data.user });
      } catch (err) {
        sendResponse({ success: false, error: String(err) });
      }
    })();
    return true;
  }

  // Handle logout action
  if (message.action === "logout") {
    chrome.storage.local.remove(['authToken']);
    sendResponse({ success: true });
    return false;
  }

  // Handle get profile action
  if (message.action === "getProfile") {
    (async () => {
      try {
        const profile = await getUserProfile();
        if (!profile) {
          sendResponse({ success: false, error: "Not authenticated" });
        } else {
          sendResponse({ success: true, profile });
        }
      } catch (err) {
        sendResponse({ success: false, error: String(err) });
      }
    })();
    return true;
  }

  if (message.action === "analyzeLinkAI") {
    // AI analysis only
    if (!message.link) {
      sendResponse({ success: false, error: "Missing link for AI analysis" });
      return false;
    }
    
    (async () => {
      try {
        // Check if user is authenticated
        const profile = await getUserProfile();
        if (!profile) {
          sendResponse({ success: false, error: "Please log in to use this feature", requiresAuth: true });
          return;
        }
        
        // Check if user has tokens
        if (!profile.tokenLimit || profile.tokenLimit === -1 || profile.tokensUsed < profile.tokenLimit) {
          // Consume a token
          try {
            await consumeToken();
          } catch (tokenErr) {
            sendResponse({ success: false, error: tokenErr.message, tokenLimitExceeded: true });
            return;
          }
        } else {
          sendResponse({ success: false, error: "Token limit exceeded. Please upgrade your plan.", tokenLimitExceeded: true });
          return;
        }
        
        const link = message.link;
        const aiData = await analyzeWithAI(link);
        sendResponse({ success: true, ai: aiData.ai });
      } catch (err) {
        sendResponse({ success: false, error: String(err) });
      }
    })();
    return true;
  }

  if (message.action === "analyzeLinkVT") {
    // VirusTotal scan only (no token required for free service)
    if (!message.link) {
      sendResponse({ success: false, error: "Missing link for VT analysis" });
      return false;
    }
    
    (async () => {
      try {
        const link = message.link;
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
    // Website analysis for copied link
    (async () => {
      try {
        // Check if user is authenticated
        const profile = await getUserProfile();
        if (!profile) {
          sendResponse({ success: false, error: "Please log in to use this feature", requiresAuth: true });
          return;
        }
        
        // Check if user has tokens
        if (!profile.tokenLimit || profile.tokenLimit === -1 || profile.tokensUsed < profile.tokenLimit) {
          // Consume a token
          try {
            await consumeToken();
          } catch (tokenErr) {
            sendResponse({ success: false, error: tokenErr.message, tokenLimitExceeded: true });
            return;
          }
        } else {
          sendResponse({ success: false, error: "Token limit exceeded. Please upgrade your plan.", tokenLimitExceeded: true });
          return;
        }
        
        // Use provided URL from message, or fallback to current tab
        let url = message.url;
        if (!url) {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (!tab || !tab.url) {
            sendResponse({ success: false, error: "No URL provided" });
            return;
          }
          url = tab.url;
        }
        
        const websiteData = await analyzeWebsite(url);
        console.log('🛡️ RedFlag Background: analyzeWebsite returned:', websiteData);
        
        if (websiteData.error) {
          sendResponse({ success: false, error: websiteData.error });
        } else {
          // The backend returns { success: true, data: {...} }
          // Extract the data field
          const actualData = websiteData.data || websiteData;
          console.log('🛡️ RedFlag Background: Sending websiteData:', actualData);
          
          sendResponse({
            success: true,
            websiteData: actualData
          });
        }
      } catch (err) {
        sendResponse({ success: false, error: String(err) });
      }
    })();
    return true;
  }

  // Handle allowNavigation action (when user clicks Proceed in intercepted tab)
  if (message.action === "allowNavigation") {
    const url = message.url;
    const tabId = message.tabId;
    if (url) {
      console.log('🛡️ RedFlag Background: Allowing navigation to:', url, 'for tab:', tabId);
      // Add to allowed set
      allowedNavigations.add(url);
      // Also mark this tab as no longer analyzing
      analyzingTabs.delete(tabId);
      blockedUrls.delete(tabId);
      // Auto-remove after 10 seconds to prevent stale entries
      setTimeout(() => allowedNavigations.delete(url), 10000);
    }
    sendResponse({ success: true });
    return false;
  }

  // Handle allowNavigationFromContent (when user clicks Proceed in content script overlay)
  if (message.action === "allowNavigationFromContent") {
    const url = message.url;
    if (url) {
      console.log('🛡️ RedFlag Background: Allowing navigation from content script:', url);
      allowedNavigations.add(url);
      // Auto-remove after 10 seconds
      setTimeout(() => allowedNavigations.delete(url), 10000);
    }
    sendResponse({ success: true });
    return false;
  }

  sendResponse({ success: false, error: "Invalid action" });
});