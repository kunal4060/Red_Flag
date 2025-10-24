# Quick Start Guide - Optimized RedFlag

## Prerequisites
- Node.js v14+ installed
- Python 3.7+ installed
- MongoDB running
- Required Python packages (see Installation)

## Installation

### 1. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

Required packages:
- torch
- beautifulsoup4
- requests

### 2. Install Node.js Dependencies
```bash
cd backend
npm install
```

### 3. Set Up Environment Variables
Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/redflag
JWT_SECRET=your_jwt_secret_here
```

## Running the Optimized System

### Option 1: Start Everything (Recommended for Testing)

**Terminal 1 - Test Website:**
```bash
cd website
python -m http.server 8080
```

**Terminal 2 - Backend Server:**
```bash
cd backend
npm start
```

**Terminal 3 - Frontend (Optional):**
```bash
cd frontend
npm run dev
```

### Option 2: Production Mode

**Backend Only:**
```bash
cd backend
npm start
```

## Verifying the Optimization

### 1. Check AI Service Initialization

When you start the backend, you should see:
```
Server is running on port:5000
Initializing AI service...
[AI Service stderr]: [InferenceService] Model loaded successfully from ...
AI service initialized successfully
```

✓ If you see this, the AI model is loaded and ready!

### 2. Test Button Link Extraction

Run the test script:
```bash
python test_button_links.py
```

Expected output:
```
Found 1 anchor links
  - https://example.com

Found 5 button links
  - https://test1.com
  - https://test2.com
  - https://test3.com
  - https://test4.com
  - https://test5.com

Total links found: 6

✓ TEST PASSED: All expected links were found!
```

### 3. Test Full Website Analysis

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/website/analyze \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"http://localhost:8080\"}"
```

**Using frontend:**
1. Open `http://localhost:5173` (or your frontend URL)
2. Navigate to the analysis page
3. Enter URL: `http://localhost:8080`
4. Click "Analyze"
5. Watch the results appear quickly!

### 4. Performance Comparison

**Before optimization:**
- Analyzing 10 links: ~30-40 seconds
- Each link loads the model independently

**After optimization:**
- Analyzing 10 links: ~3-5 seconds
- Model loaded once, all predictions fast!

## Troubleshooting

### AI Service Fails to Initialize

**Error:** `Failed to initialize AI service`

**Solutions:**
1. Check if `backend/AI/url_cnn_cpu2.pth` exists
2. Verify Python dependencies are installed
3. Check Python version (3.7+)

**Command to verify:**
```bash
cd backend/AI
python inference_service.py --url "https://example.com"
```

### Links Not Being Extracted

**Issue:** Some button links not found

**Solutions:**
1. Check HTML structure of target website
2. Verify button onclick patterns match regex
3. Check browser console for JavaScript-rendered content

**Test extraction manually:**
```bash
cd AI
python fetch_links.py "http://localhost:8080"
```

### Model Predictions Seem Wrong

**Issue:** All URLs marked as malicious/benign

**Solutions:**
1. Verify model file is not corrupted
2. Check model training data
3. Test with known good/bad URLs

## API Documentation

### Analyze Website Endpoint

**URL:** `POST /api/website/analyze`

**Request Body:**
```json
{
  "url": "http://localhost:8080"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "input_url": "http://localhost:8080",
    "total_links": 15,
    "links_analyzed": 15,
    "results": [
      {
        "url": "https://www.google.com",
        "analysis": {
          "ai_result": {
            "label": "benign",
            "score": 0.03
          }
        }
      }
    ]
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Performance Tips

### For Best Performance:

1. **Keep Backend Running**
   - The model stays loaded in memory
   - First analysis after restart takes longer (model load)
   - Subsequent analyses are fast!

2. **Batch Analysis**
   - Analyze multiple URLs at once when possible
   - The system is optimized for batch processing

3. **Resource Allocation**
   - Ensure sufficient RAM (model needs ~100-200MB)
   - Python process remains active (normal behavior)

## Testing the Enhanced Features

### Test Button Link Extraction:

Create a test page with buttons:
```html
<!DOCTYPE html>
<html>
<body>
    <button onclick="window.location='https://example1.com'">Button 1</button>
    <button onclick="location.href='https://example2.com'">Button 2</button>
    <button data-href="https://example3.com">Button 3</button>
</body>
</html>
```

Save as `test.html` and analyze!

### Monitor Performance:

Watch the console logs:
```
Fetching links from: http://localhost:8080
Found 15 links
Analyzing links with AI service...
Analysis complete
```

Notice how fast "Analyzing links" → "Analysis complete" happens!

## Next Steps

1. **Production Deployment**
   - Use PM2 or similar for process management
   - Configure proper logging
   - Set up monitoring

2. **Scaling**
   - Consider Redis caching for repeat URLs
   - Load balance multiple backend instances
   - Implement rate limiting

3. **Enhancement Ideas**
   - Add progress tracking for large batches
   - Implement WebSocket for real-time updates
   - Cache analysis results

## Support

For issues or questions:
1. Check logs in backend console
2. Verify all prerequisites are met
3. Test components individually
4. Review OPTIMIZATION_CHANGES.md for details

Happy analyzing! 🚀
