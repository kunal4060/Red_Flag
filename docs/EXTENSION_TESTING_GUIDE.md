# RedFlag Extension - Testing Guide

## 🚀 How to Load the Extension

### Step 1: Open Chrome Extensions Page
1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)

### Step 2: Load the Extension
1. Click **Load unpacked**
2. Navigate to: `c:\Users\Anikait\Documents\Coding Adventure\Hackathon\RedFlag\extention\RedFlagExtention\dist`
3. Select the `dist` folder
4. Click **Select Folder**

### Step 3: Verify Installation
You should see "RedFlag Extension" in your extensions list with:
- Name: RedFlag Extension
- Version: 1.0.0
- ID: (auto-generated)
- Status: Enabled

## 🧪 How to Test Link Interception

### Test 1: Basic Link Click
1. Go to any website (e.g., `https://www.google.com`)
2. Open browser console (`F12` → Console tab)
3. Look for: `🛡️ RedFlag link protection activated on: https://www.google.com`
4. Click any external link
5. You should see console logs like:
   ```
   🛡️ RedFlag: Click detected
   🛡️ RedFlag: Intercepting link: https://example.com
   🛡️ RedFlag: BLOCKING navigation to: https://example.com
   🛡️ RedFlag: Showing loading overlay
   ```
6. A black overlay should appear with "Analyzing Link" message

### Test 2: Login First (Required)
The link interception feature requires authentication:

1. Click the RedFlag extension icon in toolbar
2. Click the profile icon (top-right)
3. Click **Login**
4. Enter your credentials:
   - Email: (your registered email)
   - Password: (your password)
5. Once logged in, you should see your profile with token usage

### Test 3: Full Analysis Flow
1. Make sure you're logged in
2. Visit a simple website like `https://example.com`
3. Click any external link
4. Watch the flow:
   - ✅ Navigation blocked
   - ✅ Black overlay appears
   - ✅ "Analyzing Link..." message
   - ✅ Analysis completes (may take 10-30 seconds)
   - ✅ Results modal shows with:
     - Risk level (Low/Medium/High)
     - Links found
     - Malicious/Benign counts
   - ✅ Two buttons appear:
     - Cancel (closes modal)
     - Proceed (opens link)

## 🐛 Troubleshooting

### Extension Not Working?
1. **Reload the extension:**
   - Go to `chrome://extensions/`
   - Find RedFlag Extension
   - Click the refresh icon (🔄)

2. **Check Console for Errors:**
   - Open any webpage
   - Press `F12` to open DevTools
   - Go to Console tab
   - Look for RedFlag messages or errors

3. **Verify Backend is Running:**
   - Make sure backend server is running on `http://localhost:5001`
   - Extension needs backend for analysis

4. **Check Permissions:**
   - Go to `chrome://extensions/`
   - Click "Details" on RedFlag Extension
   - Verify these permissions are granted:
     - Read and change all your data on all websites
     - Store data
     - Display notifications

### Console Shows "Not Authenticated"?
- You need to log in through the extension popup
- Click extension icon → Profile → Login

### Links Still Opening Without Analysis?
1. Check console for logs - if no "RedFlag: Click detected" appears:
   - Extension might not be loaded
   - Try reloading the extension
   - Hard refresh the webpage (Ctrl+Shift+R)

2. If logs appear but no overlay:
   - Check for JavaScript errors in console
   - Verify content.js is in dist folder
   - Reload extension

### Analysis Takes Too Long?
- Insight Analysis can take 10-30 seconds
- It analyzes ALL links on the target website
- Make sure Python backend is running
- Check backend console for errors

## 📝 Expected Console Output

When working correctly, you should see:
```
🛡️ RedFlag link protection activated on: https://example.com
🛡️ RedFlag: Click detected <a href="...">
🛡️ RedFlag: Intercepting link: https://target.com
🛡️ RedFlag: Different destination, will analyze
🛡️ RedFlag: BLOCKING navigation to: https://target.com
🛡️ RedFlag: Showing loading overlay
🛡️ RedFlag: Starting analysis
🛡️ RedFlag: Analysis response: {success: true, websiteData: {...}}
```

## ✅ Success Criteria

The extension is working if:
1. ✅ Console shows activation message on page load
2. ✅ Clicking links shows console logs
3. ✅ Black overlay appears immediately
4. ✅ Analysis completes and shows results
5. ✅ You can choose to Cancel or Proceed
6. ✅ Tokens are consumed (check profile in popup)

## 🔧 Development Tips

### Making Changes
1. Edit files in `public/` folder (content.js, background.js, etc.)
2. Copy updated files to `dist/` folder
3. Go to `chrome://extensions/`
4. Click reload button on RedFlag Extension
5. Hard refresh any open tabs (Ctrl+Shift+R)

### Quick Reload Script
Instead of manually copying files, you can:
```bash
# Copy content.js to dist
copy public\content.js dist\content.js

# Copy manifest.json to dist  
copy public\manifest.json dist\manifest.json

# Copy background.js to dist
copy public\background.js dist\background.js
```

Then reload the extension in Chrome.
