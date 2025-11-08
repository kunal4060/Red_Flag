#!/usr/bin/env python3
"""
Simplified script to analyze all links from a website using AI model
"""

import subprocess
import sys
import json
import argparse
import os

def fetch_links(url):
    """
    Fetch links from a website using the fetch_links.py script
    """
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        fetch_script = os.path.join(script_dir, "AI", "fetch_links.py")
        
        print(f"Fetching links from {url}...")
        result = subprocess.run([
            sys.executable, fetch_script, url
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            print(f"Error fetching links: {result.stderr}")
            return None
    except Exception as e:
        print(f"Error fetching links: {str(e)}")
        return None

def analyze_url_with_ai(url):
    """
    Analyze a URL using the AI model
    """
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        inference_script = os.path.join(script_dir, "backend", "AI", "run_inference.py")
        
        print(f"  Analyzing: {url}")
        result = subprocess.run([
            sys.executable, inference_script, "--url", url
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            return {"error": f"AI analysis failed: {result.stderr}"}
    except Exception as e:
        return {"error": str(e)}

def main():
    parser = argparse.ArgumentParser(description="Analyze all links from a website using AI")
    parser.add_argument("--url", type=str, required=True, help="URL of the website to analyze")
    parser.add_argument("--output", type=str, help="Output file for results (JSON format)")
    
    args = parser.parse_args()
    
    # Fetch links from the website
    links_data = fetch_links(args.url)
    if not links_data:
        print("Failed to fetch links from website")
        return 1
    
    print(f"Found {links_data['count']} links on {links_data['url']}")
    
    # Analyze each link with AI
    results = {
        "input_url": links_data['url'],
        "total_links": links_data['count'],
        "links_analyzed": 0,
        "results": []
    }
    
    malicious_count = 0
    benign_count = 0
    
    for i, link in enumerate(links_data['links']):
        print(f"Analyzing link {i+1}/{links_data['count']}...")
        analysis = analyze_url_with_ai(link)
        results['results'].append({
            "url": link,
            "analysis": analysis
        })
        results['links_analyzed'] = i + 1
        
        # Count malicious vs benign
        if "ai_result" in analysis:
            ai_result = analysis["ai_result"]
            if isinstance(ai_result, dict) and ai_result.get("label") == "malicious":
                malicious_count += 1
                score = ai_result.get('score', 0) if isinstance(ai_result, dict) else 0
                print(f"    Result: MALICIOUS (score: {score:.4f})")
            else:
                benign_count += 1
                score = ai_result.get('score', 0) if isinstance(ai_result, dict) else 0
                print(f"    Result: BENIGN (score: {score:.4f})")
        else:
            error_msg = analysis.get('error', 'Unknown error') if isinstance(analysis, dict) else 'Unknown error'
            print(f"    Result: ERROR - {error_msg}")
    
    # Output results
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\nResults saved to {args.output}")
    else:
        print("\n" + json.dumps(results, indent=2))
    
    # Print summary
    print(f"\n=== SUMMARY ===")
    print(f"Total links found: {links_data['count']}")
    print(f"Links analyzed: {results['links_analyzed']}")
    print(f"Malicious links: {malicious_count}")
    print(f"Benign links: {benign_count}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())