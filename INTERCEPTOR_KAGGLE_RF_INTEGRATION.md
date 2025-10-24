# Browser Link Interceptor - Kaggle Random Forest Integration

## Overview
The browser link interceptor now uses a **Kaggle Random Forest machine learning model** for link analysis instead of VirusTotal API, while the popup's copied link analyzer continues to use the custom AI model.

## Why Kaggle RF Instead of VirusTotal?

### Advantages
- ✅ **No API rate limits** - Unlimited analysis
- ✅ **Faster** - No external API delays
- ✅ **Offline capable** - Works without internet for feature extraction
- ✅ **Free** - No API key costs
- ✅ **More links** - Can analyze up to 20 links per website
- ✅ **Transparent** - Shows risk factors detected

### Model Details
- **Source**: Kaggle phishing detection Random Forest
- **Method**: Feature-based URL analysis
- **Features**: 20+ URL characteristics (length, special chars, subdomains, etc.)
- **Fallback**: Enhanced heuristic scoring if model unavailable

## Changes Made

### 1. Backend Changes
- **New Endpoint**: Added `/api/website/fetch-links` endpoint in `website.controller.js`
  - Fetches links from a website without AI analysis
  - Returns raw list of links for the extension to analyze with VirusTotal
  
### 2. Extension Background Script (`background.js`)
- **New Function**: `analyzeWebsiteWithKaggle(url)`
  - Fetches links from the target website via backend
  - Analyzes links using Kaggle Random Forest model via backend API
  - Can analyze up to 20 links per website
  - Returns results in the same format as the AI model for consistency
  
- **Updated Functions**:
  - `analyzeWebsite(url)` - Kept for popup's AI-based analysis (requires authentication & tokens)
  - `performTabAnalysis()` - Now uses Kaggle RF instead of VirusTotal
  
- **New Message Action**: `analyzeWebsiteForInterceptor`
  - Used by content script for interceptor analysis
  - Uses Kaggle RF (no authentication or tokens required)
  - Separate from `analyzeWebsite` which is used by popup

### 3. Content Script (`content.js`)
- **Updated**: `analyzeUrl()` function
  - Now sends `analyzeWebsiteForInterceptor` action instead of `analyzeWebsite`
  - Updated loading message to indicate Kaggle RF analysis
  - Updated footer to show "Kaggle Random Forest ML"

### 4. Backend Changes
- **New Service**: `kaggle.service.js` - Node.js service wrapper for Python Kaggle model
- **New Controller**: `kaggle.controller.js` - Handles batch and single URL analysis
- **New Routes**: `/api/kaggle/analyze-batch` and `/api/kaggle/analyze`
- **New Python Service**: `kaggle_phishing_service.py` - ML-based URL analysis

### 5. Analysis Differences

#### Interceptor (Kaggle RF)
- ✅ **No authentication required**
- ✅ **No token consumption**
- ✅ **Free for users**
- ✅ **Fast** - No API delays
- ✅ **Up to 20 links** per website
- ✅ **Transparent** - Shows detected risk factors

#### Popup Copied Link Analyzer (AI Model)
- ✅ Fast analysis (persistent model in memory)
- ✅ Unlimited links per analysis
- ⚠️ Requires user authentication
- ⚠️ Consumes tokens based on user plan

## How It Works

### Link Interception Flow (Kaggle RF)
1. User clicks a link or types URL in address bar
2. Navigation is intercepted by `webNavigation.onBeforeNavigate` listener
3. User sees loading page
4. Extension calls `analyzeWebsiteForInterceptor` action
5. Background script:
   - Fetches links from destination via `/api/website/fetch-links`
   - Sends links to `/api/kaggle/analyze-batch`
   - Backend analyzes up to 20 links with Kaggle RF Python service
   - Each link analyzed with feature extraction (instant)
   - Results are aggregated
6. Results page is shown with Kaggle RF analysis
7. User can see risk factors and proceed or cancel

### Popup Analysis Flow (AI Model)
1. User copies a link
2. User clicks "Insight Analysis" in popup
3. Extension checks authentication and tokens
4. Extension calls `analyzeWebsite` action
5. Background script calls `/api/website/analyze`
6. Backend fetches links and analyzes with AI model
7. Results shown in popup

## Testing

To test the Kaggle RF integration:

1. **Ensure backend is running**: `cd backend && npm start`
2. **Test Kaggle service**: `cd AI && python backend/AI/kaggle_phishing_service.py`
   - Should show demo analysis of test URLs
3. **Load extension in Chrome**
4. **Test link interception**:
   - Navigate to any website
   - Click any link - should show Kaggle RF analysis
5. **Test popup analyzer**:
   - Copy a URL
   - Open extension popup
   - Click "Insight Analysis" - should use AI model (not Kaggle)

## Feature Extraction

The Kaggle RF model analyzes 20+ URL features:

### Length Features
- Total URL length
- Domain length
- Path length

### Character Counts
- Dots, hyphens, underscores
- Slashes, question marks, equals signs
- @ symbols, ampersands, exclamations
- Digits and special characters

### Domain Features
- IP address detection
- Subdomain count
- HTTPS presence

### Pattern Detection
- Suspicious keywords (login, bank, verify, etc.)
- Path depth
- Query parameter count

### Risk Scoring
Each feature contributes to a weighted risk score:
- IP in URL: High risk (0.4)
- Long URL (>100 chars): High risk (0.3)
- Suspicious keywords: High risk (0.3)
- @ symbol: Very high risk (0.35)
- No HTTPS: Medium risk (0.15)
- Many subdomains: High risk (0.25)
- Excessive hyphens: Medium risk (0.2)

Threshold: 0.45 (normalized score)

## Future Improvements

1. **Train Custom Model**: Fine-tune on project-specific phishing data
2. **Feature Engineering**: Add more sophisticated URL features
3. **Model Ensemble**: Combine multiple ML models for better accuracy
4. **Real-time Learning**: Update model based on user feedback
5. **Performance Optimization**: Cache results, parallel processing
