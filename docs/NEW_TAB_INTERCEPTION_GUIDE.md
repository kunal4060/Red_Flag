# New Tab Interception - Implementation Guide

## What Was Fixed

### 1. Extension Context Invalidation Error ✅
**Problem:** When the extension was reloaded, content scripts would show "Extension context invalidated" errors.

**Solution:** Added proper error handling in `content.js`:
```javascript
chrome.runtime.sendMessage(
  { action: "analyzeWebsite", url: url },
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
```

### 2. New Tab Interception ✅
**Problem:** Middle-click, Ctrl+click, and "Open in new tab" were not being intercepted.

**Solution:** Implemented `chrome.webNavigation.onBeforeNavigate` listener in `background.js`:

#### How It Works:
1. **Track tab creation**: `chrome.tabs.onCreated` records when new tabs are created
2. **Intercept navigation**: `chrome.webNavigation.onBeforeNavigate` catches navigation BEFORE it happens
3. **Check if recent tab**: Only intercepts tabs created within last 1000ms (new tab opens)
4. **Redirect to about:blank**: Stops the original navigation
5. **Show analysis screen**: Injects loading UI → performs analysis → shows results
6. **User decision**: User can either "Close Tab" or "Proceed" to the site

## Testing Instructions

### 1. Reload the Extension
1. Go to `chrome://extensions/`
2. Find "RedFlag Extension"
3. Click the reload button (🔄)

### 2. Test Regular Click Interception (In Current Tab)
1. Navigate to any website (e.g., https://example.com)
2. **Left-click** any external link
3. ✅ Should show overlay with analysis in the SAME tab

### 3. Test New Tab Interception
On the same website, try these:

#### Test 1: Middle-Click
1. **Middle-click** (scroll wheel click) on any external link
2. ✅ New tab should open with "RedFlag Security Check" loading screen
3. ✅ After analysis, shows results with "Close Tab" or "Proceed" buttons

#### Test 2: Ctrl+Click
1. Hold **Ctrl** (or **Cmd** on Mac) and **left-click** a link
2. ✅ Same behavior as middle-click

#### Test 3: Right-Click → Open in New Tab
1. **Right-click** on a link
2. Select "Open link in new tab"
3. ✅ Same behavior as middle-click

### 4. Check Background Console
1. Go to `chrome://extensions/`
2. Click "service worker" under RedFlag Extension
3. You should see logs like:
   - `🛡️ RedFlag Background: Tab created: 123`
   - `🛡️ RedFlag Background: Intercepting navigation in new tab: {...}`

## Expected Behavior

### For Same-Page Clicks:
- Overlay appears in current tab
- Black background with analysis modal
- Shows loading → results → user decision

### For New Tab Opens:
- New tab opens immediately
- Redirected to `about:blank`
- Loading screen appears
- Analysis runs
- Results displayed with stats:
  - Links Found
  - Links Analyzed  
  - Malicious count
  - Benign count
- Two buttons:
  - **✖️ Close Tab**: Closes the tab
  - **✓ Proceed Safely** / **⚠️ Proceed Anyway**: Navigates to the site

## Error Handling

### If Analysis Fails:
- Shows "❌ Analysis Failed" screen
- Displays error message
- Still allows user to proceed with **➡️ Proceed Anyway** button

### If Extension Context Is Invalid:
- Content script shows error message
- User is prompted to refresh the page

## Technical Implementation Details

### Key Files Modified:
1. **`content.js`**: Added error handling for extension context invalidation
2. **`background.js`**: 
   - Added `chrome.webNavigation.onBeforeNavigate` listener
   - Implemented `performTabAnalysis()` function
   - Tracks tab creation time to identify new tab opens

### Chrome APIs Used:
- `chrome.tabs.onCreated` - Track when tabs are created
- `chrome.webNavigation.onBeforeNavigate` - Intercept navigation before it happens
- `chrome.tabs.update` - Redirect tab to about:blank, then to target URL
- `chrome.scripting.executeScript` - Inject analysis UI into tab

### Permissions Required:
- `webNavigation` - To intercept navigation events
- `tabs` - To manipulate tabs
- `scripting` - To inject scripts into tabs

## Troubleshooting

### New tabs are not being intercepted:
1. Check if extension has `webNavigation` permission in `manifest.json`
2. Verify background service worker is running (`chrome://extensions/`)
3. Check background console for error messages

### Extension context invalidated error persists:
1. **Refresh the page** after reloading the extension
2. The error occurs because old content scripts are still running
3. After refresh, new content scripts will load properly

### Analysis fails for all sites:
1. Ensure backend is running (`http://localhost:5001`)
2. Check if user is logged into the extension
3. Verify user has tokens remaining (check dashboard)

## Performance Notes

- Only tabs created within **1000ms** are intercepted (avoids interfering with user's existing tabs)
- Analysis happens asynchronously (doesn't block browser)
- If analysis fails, navigation is allowed to proceed anyway

## Next Steps

If right-click context menu "Open in new tab" still doesn't work:
- It should work with current implementation (uses `webNavigation` API)
- If issues persist, we may need to add `chrome.contextMenus` override

