# Testing Guide for Token-Based Extension System

## Prerequisites

1. **MongoDB** must be running with your database
2. **Backend server** must be running on port 5001
3. **User account** created on the RedFlag website

## Setup Steps

### 1. Run Database Migration

First, ensure existing users have the new token fields:

```bash
cd backend
node migrate_users.js
```

Expected output:
```
✅ Connected to MongoDB
✅ Migration complete!
   - Modified X users
   - Matched X users
```

### 2. Start Backend Server

If not already running:

```bash
cd backend
npm start
```

Expected output:
```
Server is running on port:5001
✅ Connected to MongoDB successfully
```

### 3. Test Backend API (Optional)

Test the new token endpoints:

```bash
cd backend
node test_token_system.js
```

**Important:** Edit `test_token_system.js` first and change the credentials:
```javascript
const testCredentials = {
  email: "your@email.com",      // Your actual email
  password: "yourpassword"       // Your actual password
};
```

Expected output:
```
🚀 Starting Token System Tests
================================

📝 Testing Extension Login...
✅ Login successful!
   Token: eyJhbGciOiJIUzI1NiI...
   User: John Doe
   Plan: free
   Tokens: 0/10

📝 Testing Get Profile...
✅ Profile retrieved!
...

✅ All tests completed!
```

### 4. Build Extension

**Note:** If you encounter PowerShell script execution issues, use one of these alternatives:

**Option A - Using CMD:**
```cmd
cd extention\RedFlagExtention
.\node_modules\.bin\vite build
```

**Option B - Manual build (if npm is blocked):**
1. Open `extention\RedFlagExtention` in VS Code
2. Open terminal in VS Code (Ctrl+`)
3. Run: `.\node_modules\.bin\vite build`

**Option C - Enable PowerShell scripts (Admin required):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
npm run build
```

Expected output:
```
vite v4.x.x building for production...
✓ built in XXXms
```

### 5. Load Extension in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Navigate to: `extention\RedFlagExtention\dist`
6. Click "Select Folder"

## Testing the Extension

### Test 1: Profile Circle Display

1. Click the extension icon in Chrome toolbar
2. **Expected:** You should see a profile circle with a user icon in the top-right
3. **Expected:** The circle should have a red gradient background

### Test 2: Not Logged In State

1. If this is first time using extension, click the profile circle
2. **Expected:** Dropdown shows:
   - "Not Logged In" message
   - "Log in to start using the extension" text
   - Blue "Login" button

### Test 3: Login Flow

1. Click "Login" button
2. **Expected:** Login modal appears with:
   - Email field
   - Password field
   - Cancel and Login buttons
3. Enter your credentials from the website
4. Click "Login"
5. **Expected:** Modal closes, profile circle now shows your initials

### Test 4: Profile Display

1. Click profile circle again
2. **Expected:** Dropdown shows:
   - Your full name and email
   - Current plan (Free, Basic, Premium, or Enterprise)
   - Token usage with progress bar (e.g., "0 / 10")
   - Red "Logout" button

### Test 5: Token Consumption - AI Analysis

1. Copy a URL to clipboard (e.g., `https://google.com`)
2. Click "AI Analysis" button
3. **Expected:** 
   - Status shows "🔍 Running AI analysis..."
   - After completion: "✅ AI analysis complete"
   - Click profile circle → tokens should increment (e.g., "1 / 10")

### Test 6: Token Consumption - Insight Analysis

1. Navigate to any website (e.g., google.com)
2. Click extension icon
3. Click "Insight Analysis" button
4. **Expected:**
   - Status shows "🔍 Analyzing current website..."
   - After completion: "✅ Insight Analysis complete"
   - Click profile circle → tokens should increment (e.g., "2 / 10")

### Test 7: Deep Analysis (No Token Required)

1. Copy a URL to clipboard
2. Click "Deep Analysis" button
3. **Expected:**
   - Analysis runs normally
   - Tokens DO NOT increment
   - This uses VirusTotal API (free service)

### Test 8: Token Limit Exceeded

1. Use AI Analysis or Insight Analysis 10 times (for free plan)
2. On the 11th attempt:
3. **Expected:**
   - Error message: "❌ Token limit exceeded. Please upgrade your plan."
   - No analysis performed
   - Profile shows "10 / 10" tokens used

### Test 9: Not Authenticated Error

1. Click "Logout" from profile dropdown
2. Try to use "AI Analysis" or "Insight Analysis"
3. **Expected:**
   - Error: "❌ Please log in to use this feature"
   - Login modal appears automatically

### Test 10: Progress Bar Visual

1. Log in and check profile
2. Consume a few tokens
3. Click profile circle
4. **Expected:** Progress bar shows visual representation of token usage
   - Bar fills from left to right
   - Red gradient color
   - Percentage matches tokensUsed/tokenLimit

## Plan Testing

### Free Plan (Default)
- Token Limit: 10
- Test reaching limit

### Basic Plan
- Upgrade on website to Basic
- Token Limit: 50
- **Expected:** Tokens reset to 0 on plan change

### Premium Plan
- Upgrade to Premium
- Token Limit: 200

### Enterprise Plan
- Upgrade to Enterprise
- Token Limit: Unlimited (∞)
- **Expected:** Can perform unlimited scans

## Common Issues & Solutions

### Issue: "Not authenticated" error
**Solution:** Click profile → Login with your website credentials

### Issue: "Token limit exceeded"
**Solution:** 
1. Upgrade plan on website
2. Or wait for admin to reset your tokens
3. Or plan change resets tokens

### Issue: Extension not showing changes
**Solution:**
1. Rebuild extension: `npm run build` (in extension folder)
2. Go to `chrome://extensions/`
3. Click refresh icon on RedFlag extension
4. Close and reopen popup

### Issue: Backend errors
**Solution:**
1. Check backend is running: `http://localhost:5001`
2. Check MongoDB connection
3. Check console for errors

### Issue: Profile circle not showing
**Solution:**
1. Check browser console for errors (F12)
2. Verify extension built successfully
3. Check `dist/` folder exists

## Testing Checklist

- [ ] Migration script ran successfully
- [ ] Backend server is running
- [ ] Extension loads without errors
- [ ] Profile circle appears in extension
- [ ] Not logged in state shows correctly
- [ ] Login modal works
- [ ] Login succeeds with valid credentials
- [ ] Profile shows user info after login
- [ ] Token count displays correctly
- [ ] AI Analysis consumes token
- [ ] Insight Analysis consumes token
- [ ] Deep Analysis does NOT consume token
- [ ] Token limit exceeded shows error
- [ ] Progress bar updates correctly
- [ ] Logout works
- [ ] Re-login works after logout

## API Endpoint Testing (using Postman/Thunder Client)

### 1. Extension Login
```http
POST http://localhost:5001/api/auth/extension-login
Content-Type: application/json

{
  "email": "your@email.com",
  "password": "yourpassword"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "your@email.com",
    "plan": "free",
    "tokensUsed": 0,
    "tokenLimit": 10
  }
}
```

### 2. Check Auth (Get Profile)
```http
GET http://localhost:5001/api/auth/check
Authorization: Bearer YOUR_TOKEN_HERE
```

### 3. Consume Token
```http
POST http://localhost:5001/api/auth/consume-token
Authorization: Bearer YOUR_TOKEN_HERE
```

### 4. Get Token Status
```http
GET http://localhost:5001/api/auth/token-status
Authorization: Bearer YOUR_TOKEN_HERE
```

## Debugging

### Backend Logs
Check backend console for:
- User authentication attempts
- Token consumption events
- Errors

### Extension Logs
1. Right-click extension icon → "Inspect popup"
2. Check Console tab for errors
3. Check Network tab for API calls

### Chrome Storage
1. Go to extension popup
2. Right-click → Inspect
3. Console tab → Type: `chrome.storage.local.get(['authToken'], console.log)`
4. Should show stored JWT token

## Success Criteria

✅ All tests pass
✅ Tokens stored in MongoDB (not localStorage)
✅ Token consumption works correctly
✅ Plan limits enforced
✅ UI shows correct user info
✅ Progress bar displays accurately
✅ Authentication flow works smoothly
✅ Error messages are clear and helpful

## Next Steps After Testing

1. Test with different user accounts
2. Test plan upgrades on website
3. Test token reset on plan change
4. Test concurrent usage (multiple tabs)
5. Test backend restart (tokens persist)
6. Performance testing (many users)
