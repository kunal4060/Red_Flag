/* global chrome */
// Content script to intercept link clicks and analyze them

let isAnalyzing = false;
let pendingUrl = null;

// Create overlay for blocking and showing results
function createOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'redflag-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  `;
  
  const modal = document.createElement('div');
  modal.id = 'redflag-modal';
  modal.style.cssText = `
    background: linear-gradient(135deg, #1a1a1a 0%, #2d1a1a 100%);
    border: 2px solid #ef4444;
    border-radius: 16px;
    padding: 32px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(239, 68, 68, 0.3);
  `;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  return { overlay, modal };
}

// Show loading state
function showLoading(url) {
  const { overlay, modal } = createOverlay();
  
  modal.innerHTML = `
    <div style="text-align: center;">
      <div style="margin-bottom: 24px;">
        <svg style="width: 64px; height: 64px; margin: 0 auto; animation: spin 1s linear infinite;" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2" fill="none" stroke-dasharray="31.4" stroke-dashoffset="10" />
        </svg>
      </div>
      <h2 style="color: #ef4444; font-size: 24px; font-weight: bold; margin-bottom: 12px;">
        🔍 Analyzing Destination Website
      </h2>
      <p style="color: #9ca3af; font-size: 14px; margin-bottom: 8px;">
        Running RedFlag ML analysis...
      </p>
      <p style="color: #6b7280; font-size: 12px; margin-bottom: 16px;">
        Analyzing all links with ML model
      </p>
      <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 12px; margin-top: 16px; word-break: break-all;">
        <p style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">Destination URL:</p>
        <p style="color: #fff; font-size: 13px;">${url}</p>
      </div>
    </div>
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;
}

// Show analysis results
function showResults(url, analysisData) {
  const modal = document.getElementById('redflag-modal');
  if (!modal) return;
  
  console.log('🛡️ RedFlag: showResults called with data:', analysisData);
  
  const data = analysisData.websiteData || analysisData.data || analysisData;
  console.log('🛡️ RedFlag: Extracted data:', data);
  
  const totalLinks = data.total_links || 0;
  const analyzed = data.links_analyzed || 0;
  const results = data.results || [];
  
  console.log('🛡️ RedFlag: Stats - Total:', totalLinks, 'Analyzed:', analyzed, 'Results:', results.length);
  
  const maliciousCount = results.filter(r => r.analysis?.ai_result?.label === "malicious").length;
  const benignCount = results.filter(r => r.analysis?.ai_result?.label === "benign").length;
  
  const isSafe = maliciousCount === 0;
  const riskLevel = maliciousCount === 0 ? 'Low' : maliciousCount < 3 ? 'Medium' : 'High';
  const riskColor = isSafe ? '#10b981' : maliciousCount < 3 ? '#f59e0b' : '#ef4444';
  
  // Check if this looks like it might not have loaded properly
  const possibleError = totalLinks === 0 && analyzed === 0;
  
  modal.innerHTML = `
    <div>
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 48px; margin-bottom: 8px;">
          ${possibleError ? '⚠️' : (isSafe ? '✅' : '⚠️')}
        </div>
        <h2 style="color: ${possibleError ? '#f59e0b' : riskColor}; font-size: 24px; font-weight: bold; margin-bottom: 8px;">
          ${possibleError ? 'Analysis Complete - No Links Found' : (isSafe ? 'Destination Appears Safe' : 'Potential Risks Detected')}
        </h2>
        ${possibleError ? `
          <p style="color: #9ca3af; font-size: 13px; margin-bottom: 12px;">
            The destination website may not have any links, or the site couldn't be accessed for analysis.
          </p>
          <p style="color: #6b7280; font-size: 12px;">
            This could mean: No HTML links exist, site requires authentication, or blocks web scrapers.
          </p>
        ` : ''}
        <div style="display: inline-block; background: ${possibleError ? '#f59e0b' : riskColor}20; border: 1px solid ${possibleError ? '#f59e0b' : riskColor}; border-radius: 20px; padding: 6px 16px; margin-top: 8px;">
          <span style="color: ${possibleError ? '#f59e0b' : riskColor}; font-size: 12px; font-weight: 600;">
            Risk Level: ${possibleError ? 'Unknown' : riskLevel}
          </span>
        </div>
      </div>
      
      <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <p style="color: #9ca3af; font-size: 12px; margin-bottom: 8px;">Destination Website:</p>
        <p style="color: #fff; font-size: 13px; word-break: break-all;">${url}</p>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
        <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; padding: 16px; text-align: center;">
          <div style="color: #3b82f6; font-size: 28px; font-weight: bold;">${totalLinks}</div>
          <div style="color: #9ca3af; font-size: 11px; margin-top: 4px;">Links Found</div>
        </div>
        <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 8px; padding: 16px; text-align: center;">
          <div style="color: #a855f7; font-size: 28px; font-weight: bold;">${analyzed}</div>
          <div style="color: #9ca3af; font-size: 11px; margin-top: 4px;">Analyzed</div>
        </div>
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 16px; text-align: center;">
          <div style="color: #ef4444; font-size: 28px; font-weight: bold;">${maliciousCount}</div>
          <div style="color: #9ca3af; font-size: 11px; margin-top: 4px;">Malicious</div>
        </div>
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 16px; text-align: center;">
          <div style="color: #10b981; font-size: 28px; font-weight: bold;">${benignCount}</div>
          <div style="color: #9ca3af; font-size: 11px; margin-top: 4px;">Benign</div>
        </div>
      </div>
      
      ${maliciousCount > 0 ? `
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h3 style="color: #ef4444; font-size: 14px; font-weight: 600; margin-bottom: 12px;">⚠️ Malicious Links Detected</h3>
          <div style="max-height: 150px; overflow-y: auto;">
            ${results.filter(r => r.analysis?.ai_result?.label === "malicious").slice(0, 5).map(r => `
              <div style="background: rgba(0,0,0,0.3); border-radius: 6px; padding: 8px; margin-bottom: 8px;">
                <div style="color: #9ca3af; font-size: 11px; word-break: break-all;">${r.url}</div>
                <div style="color: #ef4444; font-size: 10px; margin-top: 4px;">
                  Confidence: ${((r.analysis?.ai_result?.score || 0) * 100).toFixed(1)}%
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <div style="display: flex; gap: 12px; margin-top: 24px;">
        <button id="redflag-cancel" style="
          flex: 1;
          background: #374151;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 14px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#374151'">
          ✖️ Cancel
        </button>
        <button id="redflag-proceed" style="
          flex: 1;
          background: ${isSafe ? '#10b981' : '#ef4444'};
          color: white;
          border: none;
          border-radius: 8px;
          padding: 14px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
          ${isSafe ? '✓ Proceed Safely' : '⚠️ Proceed Anyway'}
        </button>
      </div>
      
      <p style="color: #6b7280; font-size: 11px; text-align: center; margin-top: 16px;">
        Powered by RedFlag Security
      </p>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('redflag-cancel').addEventListener('click', () => {
    removeOverlay();
    pendingUrl = null;
  });
  
  document.getElementById('redflag-proceed').addEventListener('click', () => {
    if (pendingUrl) {
      removeOverlay();
      // Tell background to allow this navigation
      chrome.runtime.sendMessage({ 
        action: 'allowNavigationFromContent', 
        url: pendingUrl 
      }, (response) => {
        if (response?.success) {
          // Now navigate
          setTimeout(() => {
            window.location.href = pendingUrl;
          }, 100);
        }
      });
      //pendingUrl = null;
    }
  });
}

// Show error message
function showError(url, errorMessage) {
  const modal = document.getElementById('redflag-modal');
  if (!modal) return;
  
  modal.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
      <h2 style="color: #ef4444; font-size: 24px; font-weight: bold; margin-bottom: 12px;">
        Analysis Failed
      </h2>
      <p style="color: #9ca3af; font-size: 14px; margin-bottom: 16px;">
        ${errorMessage}
      </p>
      
      <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 12px; margin: 16px 0; word-break: break-all;">
        <p style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">Target URL:</p>
        <p style="color: #fff; font-size: 13px;">${url}</p>
      </div>
      
      <div style="display: flex; gap: 12px; margin-top: 24px;">
        <button id="redflag-cancel" style="
          flex: 1;
          background: #374151;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 14px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        ">
          Cancel
        </button>
        <button id="redflag-proceed" style="
          flex: 1;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 14px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        ">
          Proceed Without Analysis
        </button>
      </div>
    </div>
  `;
  
  document.getElementById('redflag-cancel').addEventListener('click', () => {
    removeOverlay();
    pendingUrl = null;
  });
  
  document.getElementById('redflag-proceed').addEventListener('click', () => {
    if (pendingUrl) {
      removeOverlay();
      window.location.href = pendingUrl;
      pendingUrl = null;
    }
  });
}

// Remove overlay
function removeOverlay() {
  const overlay = document.getElementById('redflag-overlay');
  if (overlay) {
    overlay.remove();
  }
  isAnalyzing = false;
}

// Analyze URL with Kaggle Random Forest (for interceptor)
async function analyzeUrl(url) {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(
        { action: "analyzeWebsiteForInterceptor", url: url },
        (response) => {
          // Check for extension context invalidation
          if (chrome.runtime.lastError) {
            console.error('🛡️ RedFlag: Extension context error:', chrome.runtime.lastError);
            resolve({ error: "Extension was reloaded. Please refresh this page." });
            return;
          }
          resolve(response);
        }
      );
    } catch (err) {
      console.error('🛡️ RedFlag: Error sending message:', err);
      resolve({ error: "Extension connection error. Please refresh this page." });
    }
  });
}

// Handle link click
async function handleLinkClick(event, absoluteUrl) {
  console.log('🛡️ RedFlag: handleLinkClick called with:', absoluteUrl);
  
  // Don't intercept if already analyzing
  if (isAnalyzing) {
    console.log('🛡️ RedFlag: Already analyzing, blocking');
    event.preventDefault();
    return;
  }
  
  // Don't intercept same-page anchors (hash links to same page)
  if (absoluteUrl.includes('#')) {
    const urlWithoutHash = absoluteUrl.split('#')[0];
    const currentWithoutHash = window.location.href.split('#')[0];
    if (urlWithoutHash === currentWithoutHash) {
      console.log('🛡️ RedFlag: Same-page anchor link, allowing');
      return;
    }
  }
  
  // Validate the URL
  try {
    const targetUrl = new URL(absoluteUrl);
    // Just validate, don't skip - we want to analyze ALL external links
    console.log('🛡️ RedFlag: Valid URL, will analyze:', absoluteUrl);
  } catch (e) {
    console.log('🛡️ RedFlag: Invalid URL, allowing:', e);
    return;
  }
  
  // Prevent default navigation
  console.log('🛡️ RedFlag: BLOCKING navigation to:', absoluteUrl);
  event.preventDefault();
  event.stopPropagation();
  
  isAnalyzing = true;
  pendingUrl = absoluteUrl;
  
  // Show loading overlay
  console.log('🛡️ RedFlag: Showing loading overlay');
  showLoading(absoluteUrl);
  
  try {
    // Analyze the URL
    console.log('🛡️ RedFlag: Starting analysis with URL:', absoluteUrl);
    const response = await analyzeUrl(absoluteUrl);
    console.log('🛡️ RedFlag: Analysis response:', response);
    console.log('🛡️ RedFlag: Response type:', typeof response);
    console.log('🛡️ RedFlag: Response keys:', response ? Object.keys(response) : 'null');
    
    if (response?.requiresAuth) {
      showError(absoluteUrl, "Please log in to the RedFlag extension to use this feature");
    } else if (response?.tokenLimitExceeded) {
      showError(absoluteUrl, response.error || "Token limit exceeded. Please upgrade your plan.");
    } else if (response?.success && (response.websiteData || response.data)) {
      console.log('🛡️ RedFlag: Showing results with data:', response.websiteData || response.data);
      showResults(absoluteUrl, response);
    } else if (response?.success) {
      console.log('🛡️ RedFlag: Success but no websiteData/data field');
      showResults(absoluteUrl, response);
    } else {
      console.log('🛡️ RedFlag: No success flag, showing error');
      showError(absoluteUrl, response?.error || "Analysis failed. You can still proceed.");
    }
  } catch (err) {
    console.error('🛡️ RedFlag: Error during analysis:', err);
    showError(absoluteUrl, `Error: ${err.message}`);
  }
}

// Intercept all link clicks
document.addEventListener('click', function(event) {
  console.log('🛡️ RedFlag: Click detected', event.target);
  
  // Find the closest anchor tag
  let target = event.target;
  while (target && target.tagName !== 'A') {
    target = target.parentElement;
  }
  
  if (!target || target.tagName !== 'A') {
    console.log('🛡️ RedFlag: Not a link click');
    return;
  }
  
  // Get the absolute URL directly from the href property
  // target.href gives us the absolute URL, not target.getAttribute('href')
  const href = target.href;
  if (!href) {
    console.log('🛡️ RedFlag: Link has no href');
    return;
  }
  
  console.log('🛡️ RedFlag: Intercepting link (absolute):', href);
  handleLinkClick(event, href);
}, true); // Use capture phase to intercept before other handlers

// Also intercept middle-click (for "open in new tab")
document.addEventListener('mousedown', function(event) {
  // Only intercept middle-click (button 1) and Ctrl+Click
  if (event.button !== 1 && !(event.button === 0 && (event.ctrlKey || event.metaKey))) {
    return;
  }
  
  console.log('🛡️ RedFlag: Middle/Ctrl-click detected', event.target);
  
  // Find the closest anchor tag
  let target = event.target;
  while (target && target.tagName !== 'A') {
    target = target.parentElement;
  }
  
  if (!target || target.tagName !== 'A') {
    console.log('🛡️ RedFlag: Not a link click');
    return;
  }
  
  const href = target.href;
  if (!href) {
    console.log('🛡️ RedFlag: Link has no href');
    return;
  }
  
  console.log('🛡️ RedFlag: Intercepting link for new tab:', href);
  handleLinkClick(event, href);
}, true);

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyzeNewTabLink') {
    console.log('🛡️ RedFlag: Background requested analysis for new tab link:', message.url);
    
    // Create a synthetic event to trigger analysis
    const syntheticEvent = {
      preventDefault: () => {},
      stopPropagation: () => {}
    };
    
    // Run the analysis
    handleLinkClick(syntheticEvent, message.url);
    sendResponse({ success: true });
  }
  return true;
});

// Make test function available globally
window.testRedFlag = function() {
  console.log('%c🛡️ RedFlag Test', 'color: #ef4444; font-size: 16px; font-weight: bold');
  console.log('✅ Content script is loaded and running');
  console.log('✅ Click listener is active');
  console.log('✅ Extension ID:', chrome.runtime.id);
  console.log('To test: Click any link on this page');
  alert('🛡️ RedFlag is Active!\n\nContent script loaded successfully.\nClick any external link to test.');
  return 'RedFlag is active!';
};

console.log('%c🛡️ Type testRedFlag() in console to verify extension is working', 'color: #10b981; font-size: 12px');

console.log('🛡️ RedFlag link protection activated on:', window.location.href);
console.log('🛡️ RedFlag: Content script loaded at:', new Date().toISOString());
console.log('🛡️ RedFlag: Extension ID:', chrome.runtime.id);

// Add a visual indicator that the extension is active
const indicator = document.createElement('div');
indicator.id = 'redflag-active-indicator';
indicator.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 12px 20px;
  border-radius: 30px;
  font-family: sans-serif;
  font-size: 13px;
  font-weight: 600;
  z-index: 2147483646;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  animation: slideIn 0.5s ease-out;
  cursor: pointer;
`;
indicator.innerHTML = '🛡️ RedFlag Active';
indicator.title = 'Click to hide. RedFlag is protecting your clicks!';

const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes fadeOut {
    to {
      opacity: 0;
      transform: scale(0.8);
    }
  }
`;
document.head.appendChild(style);

indicator.addEventListener('click', () => {
  indicator.style.animation = 'fadeOut 0.3s ease-out';
  setTimeout(() => indicator.remove(), 300);
});

// Add indicator after a short delay to ensure body exists
if (document.body) {
  document.body.appendChild(indicator);
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (indicator.parentElement) {
      indicator.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        if (indicator.parentElement) indicator.remove();
      }, 300);
    }
  }, 5000);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(indicator);
    setTimeout(() => {
      if (indicator.parentElement) {
        indicator.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
          if (indicator.parentElement) indicator.remove();
        }, 300);
      }
    }, 5000);
  });
}
