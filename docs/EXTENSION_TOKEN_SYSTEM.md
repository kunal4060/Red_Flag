# Extension Token-Based Usage System

## Overview
This document describes the token-based usage system implemented for the RedFlag extension, which limits the number of site scans based on the user's plan.

## Changes Made

### 1. Backend Changes

#### User Model (`backend/src/models/user.model.js`)
- **Added Fields:**
  - `tokens`: Number - Maximum tokens available (default: 10 for free plan)
  - `tokensUsed`: Number - Number of tokens consumed (default: 0)

- **Added Methods:**
  - `getTokenLimit()`: Returns token limit based on plan (free: 10, basic: 50, premium: 200, enterprise: unlimited/-1)
  - `hasTokens()`: Checks if user has tokens available
  - `consumeToken()`: Consumes one token and saves to database

#### Auth Controller (`backend/src/controllers/auth.controller.js`)
- **Updated Endpoints:**
  - `signup`, `login`, `checkAuth`: Now return token information (tokensUsed, tokenLimit)
  - `updatePlan`: Resets tokensUsed when plan changes
  
- **New Endpoints:**
  - `consumeToken`: POST endpoint to consume a token
  - `getTokenStatus`: GET endpoint to check token status
  - `extensionLogin`: POST endpoint for extension login (returns JWT in response body instead of cookie)

#### Auth Routes (`backend/src/routes/auth.route.js`)
- Added routes:
  - `POST /api/auth/extension-login` - Extension login
  - `POST /api/auth/consume-token` - Consume a token (protected)
  - `GET /api/auth/token-status` - Get token status (protected)

#### Auth Middleware (`backend/src/middleware/auth.middleware.js`)
- Updated `protectRoute` to support both:
  - Cookie-based auth (for web app)
  - Bearer token auth via Authorization header (for extension)

#### Utils (`backend/src/lib/utils.js`)
- Updated `generateToken` to optionally skip setting cookie (for extension login)

### 2. Extension Changes

#### Background Script (`extention/RedFlagExtention/public/background.js`)
- **New Helper Functions:**
  - `getAuthToken()`: Retrieves JWT from chrome.storage.local
  - `getUserProfile()`: Fetches user profile from backend
  - `consumeToken()`: Consumes a token via API call

- **Updated Functions:**
  - `analyzeWithAI()`: Sends auth token in headers
  - `analyzeWebsite()`: Sends auth token in headers

- **New Message Handlers:**
  - `login`: Handles extension login and stores JWT token
  - `logout`: Clears stored token
  - `getProfile`: Retrieves user profile

- **Updated Message Handlers:**
  - `analyzeLinkAI`: Checks authentication and token limit before analysis
  - `analyzeWebsite`: Checks authentication and token limit before analysis
  - Both handlers consume a token on successful analysis

#### Popup Component (`extention/RedFlagExtention/src/Popup.jsx`)
- **New State:**
  - `user`: Stores logged-in user information
  - `showProfile`: Controls profile dropdown visibility
  - `showLogin`: Controls login modal visibility
  - `loginForm`: Stores login credentials
  - `loginError`: Stores login error messages

- **New Functions:**
  - `loadUserProfile()`: Loads user profile on mount
  - `handleLogin()`: Processes login form submission
  - `handleLogout()`: Logs out user

- **Updated Functions:**
  - `handleCheck()`: Handles auth errors and token limit exceeded
  - `handleInsightAnalysis()`: Handles auth errors and token limit exceeded
  - Both refresh user profile after successful analysis

- **UI Changes:**
  - Replaced share icon with profile circle (FaUser icon)
  - Profile circle shows:
    - User initials when logged in
    - Click opens dropdown with user info, plan, token usage, and logout
  - Login modal:
    - Shows when user clicks login while not authenticated
    - Email and password fields
    - Cancel and Login buttons
  - Profile dropdown shows:
    - User name and email
    - Current plan
    - Token usage with progress bar
    - Logout button
  - When not logged in, shows prompt to log in

## Plan Token Limits

| Plan       | Token Limit | Description |
|------------|-------------|-------------|
| Free       | 10          | 10 scans total |
| Basic      | 50          | 50 scans total |
| Premium    | 200         | 200 scans total |
| Enterprise | Unlimited   | No limit (-1 in database) |

## Token Consumption

Tokens are consumed when:
1. **AI Analysis** (handleCheck) - Analyzes a single link from clipboard
2. **Insight Analysis** (handleInsightAnalysis) - Analyzes all links on current website

**Note:** Deep Analysis (VirusTotal) does NOT consume tokens as it uses a free external API.

## User Flow

### First Time User
1. User installs extension
2. Clicks profile circle → sees "Not Logged In"
3. Clicks "Login" button
4. Enters email and password
5. Upon successful login, profile shows user info and token count (10/10 for free plan)
6. User can now perform scans

### Authenticated User
1. Opens extension → profile circle shows user initials
2. Clicks profile circle → sees full profile info
3. Token count updates after each scan
4. When limit reached, gets error: "Token limit exceeded. Please upgrade your plan."
5. Can logout from profile dropdown

### Token Limit Exceeded
1. User performs scan
2. Backend checks: `user.hasTokens()`
3. If no tokens available, returns 403 error
4. Extension shows: "Token limit exceeded. Please upgrade your plan."
5. User must upgrade plan on website to get more tokens

## Authentication Flow

### Extension Login
1. User enters credentials in extension
2. Extension sends to `/api/auth/extension-login`
3. Backend validates credentials
4. Backend generates JWT token
5. Backend returns token in response body (not cookie)
6. Extension stores token in `chrome.storage.local`
7. All subsequent API calls include `Authorization: Bearer <token>` header

### Token Storage
- **Web App:** JWT stored in httpOnly cookie
- **Extension:** JWT stored in chrome.storage.local
- Both use same JWT secret for verification

## API Endpoints

### Authentication
- `POST /api/auth/extension-login` - Login for extension (returns token in body)
- `GET /api/auth/check` - Check auth status (requires Bearer token)
- `POST /api/auth/logout` - Logout (clears extension storage)

### Token Management
- `POST /api/auth/consume-token` - Consume one token (requires auth)
- `GET /api/auth/token-status` - Get current token status (requires auth)
- `PUT /api/auth/update-plan` - Update user plan (requires auth, resets tokens)

### Analysis (Token Required)
- `POST /api/ai/analyze` - AI analysis (requires auth, consumes token)
- `POST /api/website/analyze` - Website analysis (requires auth, consumes token)

## Database Schema

```javascript
{
  email: String,
  password: String (hashed),
  firstName: String,
  lastName: String,
  plan: String (default: "free"),
  tokens: Number (default: 10),
  tokensUsed: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

## Testing Steps

1. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Load Extension:**
   - Build extension: `cd extention/RedFlagExtention && npm run build`
   - Load unpacked extension from `dist/` folder

3. **Test Login:**
   - Click profile circle
   - Click "Login"
   - Enter credentials from website
   - Verify profile shows user info

4. **Test Token Consumption:**
   - Copy a URL to clipboard
   - Click "AI Analysis"
   - Check token count decrements
   - Repeat until limit reached

5. **Test Token Limit:**
   - Consume all tokens
   - Try another scan
   - Verify error: "Token limit exceeded"

6. **Test Plan Upgrade:**
   - On website, upgrade plan
   - Refresh extension
   - Verify new token limit

## Notes

- Tokens are stored in MongoDB, not localStorage (as required)
- Plan changes reset `tokensUsed` to 0
- Enterprise plan has unlimited tokens (-1 = unlimited)
- Extension automatically refreshes user profile after each scan
- Token consumption happens in backend, ensuring security
- Failed scans do NOT consume tokens
