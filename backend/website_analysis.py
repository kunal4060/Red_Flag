#!/usr/bin/env python3
"""
Simplified website analysis script for backend integration
"""

import subprocess
import sys
import json
import argparse
import os

# Add the project root to the path so we can import the modules
project_root = os.path.join(os.path.dirname(__file__), "..")
sys.path.append(project_root)

def fetch_links(url):
    """
    Fetch links from a website using the fetch_links.py script
    """
    try:
        # Get the path to the fetch_links.py script
        fetch_script = os.path.join(project_root, "AI", "fetch_links.py")
        
        result = subprocess.run([
            sys.executable, fetch_script, url
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            return None
    except Exception as e:
        return None

def analyze_url_with_ai(url):
    """
    Analyze a URL using the AI model
    """
    try:
        # Get the path to the run_inference.py script
        inference_script = os.path.join(project_root, "backend", "AI", "run_inference.py")
        
        result = subprocess.run([
            sys.executable, inference_script, "--url", url
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            return {"error": f"AI analysis failed"}
    except Exception as e:
        return {"error": str(e)}

def main():
    parser = argparse.ArgumentParser(description="Analyze all links from a website using AI")
    parser.add_argument("--url", type=str, required=True, help="URL of the website to analyze")
    
    args = parser.parse_args()
    
    # Fetch links from the website
    links_data = fetch_links(args.url)
    if not links_data:
        print(json.dumps({"error": "Failed to fetch links from website"}))
        return 1
    
    # Analyze each link with AI
    results = {
        "input_url": links_data['url'],
        "total_links": links_data['count'],
        "links_analyzed": 0,
        "results": []
    }
    
    for i, link in enumerate(links_data['links']):
        analysis = analyze_url_with_ai(link)
        results['results'].append({
            "url": link,
            "analysis": analysis
        })
        results['links_analyzed'] = i + 1
    
    # Output results as JSON
    print(json.dumps(results))
    
    return 0

if __name__ == "__main__":
    sys.exit(main())