# Universal Navigation Interception - Complete Guide

## What's New? 🚀

The extension now intercepts **ALL** navigations, not just link clicks on web pages!

### Previously Intercepted:
- ✅ Link clicks on web pages (content script)
- ✅ Middle-click / Ctrl+click (new tab opens)

### NOW Also Intercepts:
- ✅ **URLs typed in the address bar**
- ✅ **Links clicked from external applications** (email, Slack, Discord, etc.)
- ✅ **Bookmarks clicked**
- ✅ **Auto-generated navigations**

## How It Works

### Technical Implementation:

The extension uses `chrome.webNavigation.onBeforeNavigate` to catch ALL navigation attempts and checks the `transitionType` to identify:

1. **`typed`** - User typed URL in address bar
2. **`auto_bookmark`** - Clicked from bookmarks
3. **`generated`** - Redirects or auto-navigation
4. **`keyword`** / **`keyword_generated`** - Search keywords
5. **New tabs** - Recently created tabs (within 1000ms)

### Interception Logic:

```javascript
// Intercept if ANY of these conditions are true:
const shouldIntercept = 
  transitionType === 'typed' ||           // Address bar
  transitionType === 'auto_bookmark' ||   // Bookmarks
  transitionType === 'generated' ||       // Auto-navigation
  transitionType === 'keyword' ||         // Search
  isRecentlyCreated;                      // New tab within 1s
```

### Allowed Navigations:

When the user clicks **"Proceed"**, the URL is temporarily added to an `allowedNavigations` set for 5 seconds, allowing the navigation to complete without re-interception.

## Testing Guide

### Test 1: Typed URL in Address Bar
1. **Type** a URL in the address bar: `https://example.com`
2. Press **Enter**
3. ✅ Should show RedFlag analysis screen
4. Click **"Proceed Safely"**
5. ✅ Should navigate to the site

### Test 2: External Application Link
1. Open an **email** or **Slack** message with a link
2. **Click the link** (should open in Chrome)
3. ✅ Should show RedFlag analysis screen
4. Click **"Close Tab"** or **"Proceed"**

### Test 3: Bookmark Click
1. Create a bookmark for any website
2. **Click the bookmark**
3. ✅ Should show RedFlag analysis screen

### Test 4: Copy-Paste URL
1. Copy a URL: `https://wikipedia.org`
2. Paste in address bar and press Enter
3. ✅ Should show RedFlag analysis screen

### Test 5: Link from Another Website
1. Go to any website
2. Click a link
3. ✅ Should show analysis overlay (content script)

## What Gets Analyzed

All intercepted navigations are analyzed with **Insight Analysis**:
- Fetches all links from the destination website
- Analyzes each link with AI
- Shows statistics:
  - Total links found
  - Links analyzed
  - Malicious count
  - Benign count
- Risk assessment: Low / Medium / High

## Expected Behavior by Scenario

### Scenario 1: Typing URL
```
User types: https://google.com
       ↓
Tab navigates to: about:blank (stops navigation)
       ↓
Shows: Loading screen with analysis
       ↓
Displays: Results with link statistics
       ↓
User clicks: "Proceed Safely"
       ↓
Navigates to: https://google.com (allowed)
```

### Scenario 2: External Link Click
```
User clicks link in: Email/Slack/Discord
       ↓
Chrome opens new tab with URL
       ↓
Extension intercepts: Before page loads
       ↓
Redirects to: about:blank
       ↓
Shows: Analysis results
       ↓
User decides: Proceed or Close
```

### Scenario 3: Bookmark
```
User clicks: Bookmark
       ↓
Same as Scenario 1 (typed URL)
```

## Console Logs to Expect

### Background Console (chrome://extensions/ → service worker):
```
🛡️ RedFlag Background: Tab created: 123
🛡️ RedFlag Background: Intercepting navigation: {
  tabId: 123,
  url: "https://example.com",
  transitionType: "typed",
  isExternalOrTyped: true,
  isRecentlyCreated: false
}
🛡️ RedFlag Background: analyzeWebsite returned: {...}
🛡️ RedFlag Background: Allowing navigation to: https://example.com
```

### Page Console (F12 on the intercepted tab):
```
(Shows the analysis screen, no console logs here)
```

## Limitations & Known Issues

### 1. **Cannot Intercept First Navigation**
- The very first URL when Chrome starts may not be intercepted
- Workaround: Refresh the page after Chrome loads

### 2. **Chrome Internal Pages**
- Cannot intercept: `chrome://`, `chrome-extension://`, `about:`
- These are intentionally excluded

### 3. **Same-Site Navigation**
- Navigating within the same site (e.g., clicking "Next Page") is NOT intercepted
- Only different destinations are analyzed

### 4. **Reload/Refresh**
- Pressing F5 or clicking refresh is NOT intercepted
- `transitionType === 'reload'` is excluded

## Configuration Options

To change what gets intercepted, modify the conditions in [`background.js`](c:\Users\Anikait\Documents\Coding Adventure\Hackathon\RedFlag\extention\RedFlagExtention\public\background.js):

```javascript
// Current: Intercept typed URLs and new tabs
const isExternalOrTyped = 
  details.transitionType === 'typed' || 
  details.transitionType === 'auto_bookmark' ||
  details.transitionType === 'generated';

// To intercept EVERYTHING (including reloads):
const isExternalOrTyped = true;

// To intercept ONLY typed URLs:
const isExternalOrTyped = details.transitionType === 'typed';
```

## Troubleshooting

### Issue: "Still not intercepting typed URLs"

**Check:**
1. Extension is loaded: `chrome://extensions/`
2. Background service worker is running (check logs)
3. Backend is running: `http://localhost:5001`
4. User is logged into the extension (has auth token)
5. User has tokens remaining

**Debug:**
1. Open background console: `chrome://extensions/` → "service worker"
2. Type a URL and press Enter
3. Look for: `🛡️ RedFlag Background: Intercepting navigation:`
4. If no log appears, the listener isn't triggering

### Issue: "Analysis shows 0 links"

**This is normal if:**
- Destination site has no links (simple landing pages)
- Site blocks web scrapers (403 errors)
- Site requires authentication
- Site is a file (PDF, image, etc.)

**Check backend console for:**
```
Error fetching links: ...
```

### Issue: "Proceed button doesn't work"

**This happens if:**
- The `allowNavigation` message handler is not working
- Check background console for errors
- Try reloading the extension

## Performance Notes

- **Analysis is async**: Doesn't block browser
- **Cached for 5 seconds**: Same URL won't be re-analyzed if proceeded within 5s
- **Token consumption**: Each analysis consumes 1 token (check user's plan)

## Security Considerations

### What's Protected:
- ✅ Malicious links from emails
- ✅ Phishing sites typed accidentally  
- ✅ Bookmarks to compromised sites
- ✅ Links from external apps

### What's NOT Protected:
- ❌ Browser extensions
- ❌ Chrome settings pages
- ❌ Local file:// URLs
- ❌ Already opened tabs (refresh needed)

## Rollback Instructions

If you want to **disable** universal interception and go back to **link clicks only**:

1. Open [`background.js`](c:\Users\Anikait\Documents\Coding Adventure\Hackathon\RedFlag\extention\RedFlagExtention\public\background.js)
2. Change line ~240:
```javascript
// FROM:
if (isExternalOrTyped || isRecentlyCreated) {

// TO:
if (isRecentlyCreated) {  // Only new tabs
```
3. Reload extension

## Summary

🎯 **The extension now provides comprehensive protection** by intercepting ALL navigation attempts, analyzing destinations before they load, and giving users full control over whether to proceed.

This creates a **zero-trust browsing environment** where every destination is verified before navigation!
