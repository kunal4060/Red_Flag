# How to Rebuild and Test the Extension

## Quick Rebuild Steps

### 1. Navigate to Extension Directory
```bash
cd "c:\Users\Anikait\Documents\Coding Adventure\Hackathon\RedFlag\extention\RedFlagExtention"
```

### 2. Rebuild the Extension
```bash
npm run build
```

This will:
- Bundle the React app with Vite
- Generate the `dist` folder with all extension files
- Copy `manifest.json` and `background.js` to the dist folder

### 3. Reload Extension in Chrome

#### Option A: Using Chrome Extension Page
1. Open Chrome and go to `chrome://extensions/`
2. Find "RedFlag Extension"
3. Click the **Reload** button (circular arrow icon)

#### Option B: Remove and Re-add
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Remove" on the old extension
4. Click "Load unpacked"
5. Select the `dist` folder inside `extention/RedFlagExtention/`

## Testing the New Features

### Test 1: AI Analysis on Copied Link ✅

**Steps:**
1. Copy this URL: `https://google.com`
2. Click the RedFlag extension icon
3. Click "AI Analysis (Copied Link)"
4. Wait for result

**Expected Result:**
```
Status: ✅ AI analysis complete
Result Card:
  Classification: benign
  Confidence: ~95-98%
```

### Test 2: Deep Analysis (VirusTotal) on Copied Link ✅

**Steps:**
1. Copy this URL: `https://example.com`
2. Click the RedFlag extension icon
3. Click "Deep Analysis (Copied Link)"
4. Wait for result (may take 10-15 seconds)

**Expected Result:**
```
Status: ✅ VirusTotal scan complete
Safe Engines Card:
  Shows list of 60-70 antivirus engines
  All marked as "clean" or "undetected"
```

### Test 3: Insight Analysis on Copied Link ✅ (NEW FEATURE)

**Prerequisites:**
- Backend server running: `http://localhost:5001`
- Python environment with required packages

**Steps:**
1. Copy this URL: `http://localhost:8080` (or any website URL)
2. Click the RedFlag extension icon
3. Click "Insight Analysis (Copied Link)"
4. Wait for result (may take 20-30 seconds)

**Expected Result:**
```
Status: ✅ Insight Analysis complete
Insight Analysis Card:
  Links Found: XX
  Analyzed: XX
  Malicious: X
  Benign: XX
  
  Detailed Results section showing each link with:
    - URL
    - Classification badge (benign/malicious)
    - Confidence percentage
```

## Common Issues & Solutions

### Issue 1: "Clipboard is empty"
**Solution:** Make sure you copied a URL before clicking the button. Use Ctrl+C or right-click → Copy.

### Issue 2: "Please log in to use this feature"
**Solution:** 
1. Click the profile icon (top right)
2. Click "Login"
3. Enter your credentials
4. Try again

### Issue 3: "Token limit exceeded"
**Solution:**
1. Check your token usage in the profile dropdown
2. Upgrade your plan if needed
3. Wait for token reset (if applicable)
4. Deep Analysis (VirusTotal) doesn't consume tokens, use that instead

### Issue 4: "Failed to fetch links" or "Backend error"
**Solution:**
1. Make sure backend server is running:
   ```bash
   cd backend
   npm start
   ```
2. Check backend is accessible at `http://localhost:5001`
3. Verify Python is installed and accessible
4. Check AI service is initialized (backend logs should show "AI service initialized successfully")

### Issue 5: Extension not updating after rebuild
**Solution:**
1. Go to `chrome://extensions/`
2. Click "Remove" on the RedFlag extension
3. Click "Load unpacked"
4. Select the NEW `dist` folder
5. Make sure you're selecting the dist folder, not the root folder

## Verifying the Build

After running `npm run build`, check these files exist:

```
extention/RedFlagExtention/dist/
├── index.html
├── manifest.json
├── background.js
└── assets/
    ├── index-[hash].js
    └── index-[hash].css
```

## Development Mode (Optional)

For faster testing during development:

```bash
# Terminal 1: Run dev server
cd extention/RedFlagExtention
npm run dev

# Terminal 2: Backend server
cd backend
npm start

# Then load the extension from dist/ folder
```

## Backend Requirements

Make sure these are running:

### 1. MongoDB
```bash
# Should be running on default port 27017
# Or check your .env file for MONGODB_URI
```

### 2. Backend Server
```bash
cd backend
npm start

# Should see:
# Server is running on port: 5001
# MongoDB Connected: ...
# AI service initialized successfully
```

### 3. Python Environment
```bash
# Test Python is available
python --version

# Test required packages
pip list | grep -E "requests|beautifulsoup4|torch"
```

## Quick Verification Checklist

Before testing:
- [ ] Backend running on port 5001
- [ ] MongoDB connected
- [ ] AI service initialized
- [ ] Extension rebuilt (`npm run build`)
- [ ] Extension reloaded in Chrome
- [ ] User logged in (for AI/Insight analysis)
- [ ] User has tokens available

## Button Functionality Summary

| Button | Analyzes | Requires Auth | Consumes Token | Time |
|--------|----------|---------------|----------------|------|
| AI Analysis | Single copied URL | ✅ Yes | ✅ Yes (1) | 2-5s |
| Deep Analysis | Single copied URL | ❌ No | ❌ No | 10-15s |
| Insight Analysis | All links from copied URL | ✅ Yes | ✅ Yes (1) | 20-30s |

## Additional Notes

### Clipboard Permissions
The extension uses the Clipboard API which is available in popup context. No additional permissions needed in manifest.json.

### CORS Configuration
Backend is configured to accept requests from the extension:
```javascript
app.use(cors({ origin: true, credentials: true }));
```

### Token Tracking
After each AI or Insight analysis:
- Token count is automatically updated
- Profile dropdown shows updated usage
- Backend prevents usage if limit exceeded

## Success Indicators

✅ **Working correctly if you see:**
- Extension icon appears in toolbar
- Popup opens when clicked
- All three buttons are visible with "(Copied Link)" label
- Status updates show progress
- Results display in cards
- Profile shows correct token usage

❌ **Not working if you see:**
- "Request timeout" errors
- "Backend error" messages
- Buttons disabled permanently
- No response after clicking
- Console errors (F12 → Console tab)

## Debug Mode

Enable debug mode to see detailed logs:

1. Right-click extension icon → "Inspect popup"
2. Go to Console tab
3. Try the analysis
4. Check for errors or logs

For background script logs:
1. Go to `chrome://extensions/`
2. Click "Inspect views: service worker" under RedFlag
3. Check Console for background script logs
