# Extension: Copied Link Analysis Feature

## Overview
Updated the RedFlag browser extension to support **Insight Analysis** and **Deep Analysis** for copied links (not just the current website).

## Changes Made

### 1. Background Script (`background.js`)
**File**: `extention/RedFlagExtention/public/background.js`

**Change**: Modified the `analyzeWebsite` action to accept a URL parameter from the message instead of always using the current tab URL.

```javascript
// Before: Always analyzed current tab
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
const websiteData = await analyzeWebsite(tab.url);

// After: Uses provided URL or falls back to current tab
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
```

### 2. Popup Component (`Popup.jsx`)
**File**: `extention/RedFlagExtention/src/Popup.jsx`

**Changes**:
1. **Updated `handleInsightAnalysis` function** to read from clipboard and pass the URL to background script
2. **Updated button labels** to clarify they analyze copied links

```javascript
// Before: Analyzed current website
chrome.runtime.sendMessage({ action: "analyzeWebsite" }, (response) => {
  // ...
});

// After: Reads clipboard and analyzes that URL
const link = await navigator.clipboard.readText();
chrome.runtime.sendMessage({ action: "analyzeWebsite", url: link }, (response) => {
  // ...
});
```

## Feature Breakdown

### Three Analysis Types (All work on copied links):

#### 1. **AI Analysis** 🛡️
- **What it does**: Analyzes a single copied URL using the AI model
- **Token cost**: 1 token
- **Output**: Classification (benign/malicious) with confidence score
- **How it works**: 
  1. Reads URL from clipboard
  2. Sends to backend AI service
  3. Returns AI prediction result

#### 2. **Deep Analysis** 🔍 (VirusTotal)
- **What it does**: Scans a single copied URL with VirusTotal
- **Token cost**: Free (no token required)
- **Output**: List of engines that flagged the URL + safe engines
- **How it works**:
  1. Reads URL from clipboard
  2. Queries VirusTotal API
  3. Returns results from 70+ antivirus engines

#### 3. **Insight Analysis** 📊 (NEW - Now works on copied links)
- **What it does**: Fetches all links from the copied URL and analyzes each one with AI
- **Token cost**: 1 token
- **Output**: 
  - Total links found
  - Number analyzed
  - Count of malicious vs benign links
  - Detailed results for each link
- **How it works**:
  1. Reads URL from clipboard
  2. Fetches all links from that webpage (using `fetch_links.py`)
  3. Analyzes each link with AI model
  4. Returns comprehensive report

## User Flow

### Before (Old Behavior):
```
1. User opens extension popup
2. Clicks "Insight Analysis"
3. Extension analyzes the CURRENT TAB's website
```

### After (New Behavior):
```
1. User copies a URL (Ctrl+C or right-click copy)
2. Opens extension popup
3. Clicks "AI Analysis (Copied Link)" - analyzes single URL
   OR
   Clicks "Deep Analysis (Copied Link)" - VirusTotal scan
   OR
   Clicks "Insight Analysis (Copied Link)" - analyzes all links on that page
```

## Backend Integration

The extension communicates with the backend API:

### AI Analysis Endpoint
```
POST http://localhost:5001/api/ai/analyze
Body: { "url": "<copied-url>" }
Response: { "ai": { "label": "benign/malicious", "score": 0.95 } }
```

### Insight Analysis Endpoint
```
POST http://localhost:5001/api/website/analyze
Body: { "url": "<copied-url>" }
Response: {
  "data": {
    "total_links": 45,
    "links_analyzed": 45,
    "results": [
      { "url": "...", "analysis": { "ai_result": { "label": "benign", "score": 0.98 } } },
      ...
    ]
  }
}
```

## Token System

- **AI Analysis**: Consumes 1 token
- **Deep Analysis (VirusTotal)**: No token required
- **Insight Analysis**: Consumes 1 token (regardless of how many links analyzed)

Token limits by plan:
- Free: 10 tokens
- Basic: 50 tokens
- Premium: 200 tokens
- Enterprise: Unlimited

## UI Updates

### Button Labels (Updated for clarity):
- ✅ "AI Analysis (Copied Link)"
- ✅ "Deep Analysis (Copied Link)"
- ✅ "Insight Analysis (Copied Link)"

### Status Messages:
- "🔍 Reading clipboard for Insight Analysis..."
- "🔍 Starting Insight Analysis..."
- "✅ Insight Analysis complete"
- "❌ Please log in to use this feature"
- "❌ Token limit exceeded. Please upgrade your plan."

## Testing Instructions

### Test AI Analysis:
1. Copy a URL: `https://google.com`
2. Open extension popup
3. Click "AI Analysis (Copied Link)"
4. Should show: Classification + confidence score

### Test Deep Analysis:
1. Copy a URL: `https://example.com`
2. Open extension popup
3. Click "Deep Analysis (Copied Link)"
4. Should show: List of antivirus engine results

### Test Insight Analysis:
1. Copy a URL: `http://localhost:8080` (or any website)
2. Open extension popup
3. Click "Insight Analysis (Copied Link)"
4. Should show:
   - Total links found
   - Malicious vs Benign count
   - Detailed results for each link

## Technical Notes

### Clipboard API
The extension uses the Web Clipboard API:
```javascript
const link = await navigator.clipboard.readText();
```

### Error Handling
- Empty clipboard: "Clipboard is empty"
- Invalid URL: Backend validates and returns error
- Not authenticated: Prompts user to log in
- Token limit exceeded: Shows upgrade message
- Request timeout: 30 seconds for Insight Analysis

### Backend Python Script
The `fetch_links.py` script extracts links from:
- `<a>` anchor tags
- `<link>` tags (stylesheets, icons)
- `<img>` src and srcset
- `<script>` tags
- `<iframe>` tags
- `<form>` actions
- `<button>` onclick handlers
- Data attributes (data-href, data-url)
- Inline CSS and JavaScript
- And 16+ other sources

## Files Modified

1. ✅ `extention/RedFlagExtention/public/background.js`
   - Updated `analyzeWebsite` message handler

2. ✅ `extention/RedFlagExtention/src/Popup.jsx`
   - Updated `handleInsightAnalysis` function
   - Updated button labels

## Future Enhancements

- [ ] Add option to analyze current tab OR copied link
- [ ] Batch analysis: paste multiple URLs (one per line)
- [ ] Export results to CSV/JSON
- [ ] Historical analysis tracking
- [ ] Real-time notifications for malicious links

## Dependencies

- Backend server running on `http://localhost:5001`
- Python script: `AI/fetch_links.py`
- AI service initialized and running
- MongoDB for user authentication and token tracking
