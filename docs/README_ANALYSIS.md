# Website Link Analysis with AI

This solution allows you to fetch all links from a website and analyze each one using your AI model to detect potentially malicious URLs.

## Components

1. **[fetch_links.py](file:///c%3A/Users/Anikait/Documents/Coding%20Adventure/Hackathon/RedFlag/website/fetch_links.py)** - Fetches all links from a given website
2. **[analyze_website_simple.py](file:///c%3A/Users/Anikait/Documents/Coding%20Adventure/Hackathon/RedFlag/analyze_website_simple.py)** - Main script that orchestrates the process
3. **[run_inference.py](file:///c%3A/Users/Anikait/Documents/Coding%20Adventure/Hackathon/RedFlag/backend/AI/run_inference.py)** - Runs the AI model on individual URLs
4. **Test website** - A sample website for testing the solution

## How It Works

1. The script fetches all links from a specified website
2. Each link is analyzed using your AI model
3. Results are categorized as either "malicious" or "benign"
4. A summary report is generated

## Usage

### Prerequisites

Make sure you have the required Python packages installed:
```bash
pip install beautifulsoup4 requests torch
```

### Running the Analysis

1. Start a website (either your own or the test website):
   ```bash
   # For the test website
   cd website
   python -m http.server 8080
   ```

2. In another terminal, run the analysis:
   ```bash
   python analyze_website_simple.py --url http://localhost:8080
   ```

3. Optionally, save results to a file:
   ```bash
   python analyze_website_simple.py --url http://localhost:8080 --output results.json
   ```

### Using with Docker (Optional)

If you have Docker installed, you can containerize any website:

1. Create a Dockerfile for your website
2. Build and run the container:
   ```bash
   docker build -t my-website .
   docker run -p 8080:80 my-website
   ```
3. Run the analysis:
   ```bash
   python analyze_website_simple.py --url http://localhost:8080
   ```

## Test Results

When running against the test website, you should see results similar to:

```
=== SUMMARY ===
Total links found: 11
Links analyzed: 11
Malicious links: 6
Benign links: 5
```

The AI correctly identifies known test URLs for malware and phishing as malicious, while identifying popular websites like Google and GitHub as benign.

## Customization

You can modify the following parameters in [analyze_website_simple.py](file:///c%3A/Users/Anikait/Documents/Coding%20Adventure/Hackathon/RedFlag/analyze_website_simple.py):

- `timeout` - Adjust the timeout for AI analysis
- `max_workers` - Control concurrent analysis (currently set to sequential processing)
- Output format - Modify how results are displayed or saved

## Troubleshooting

If you encounter issues:

1. Ensure all Python dependencies are installed
2. Check that the website is accessible
3. Verify the AI model files are in the correct location
4. Make sure you're using Python 3.7 or higher