import subprocess
import sys
import json
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
import argparse

def analyze_url_with_ai(url, model_path=None):
    """
    Analyze a URL using the AI model
    
    Args:
        url (str): URL to analyze
        model_path (str): Path to the model file
    
    Returns:
        dict: Analysis result
    """
    try:
        # Get the directory of this script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        inference_script = os.path.join(script_dir, "run_inference.py")
        
        # Prepare command
        cmd = [sys.executable, inference_script, "--url", url]
        if model_path:
            cmd.extend(["--model", model_path])
        
        # Run the inference script
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            # Parse the JSON output
            return json.loads(result.stdout)
        else:
            return {
                "error": f"AI analysis failed with return code {result.returncode}",
                "stderr": result.stderr,
                "stdout": result.stdout
            }
    except Exception as e:
        return {
            "error": str(e)
        }

def analyze_links(links, model_path=None, max_workers=5):
    """
    Analyze multiple links using the AI model
    
    Args:
        links (list): List of URLs to analyze
        model_path (str): Path to the model file
        max_workers (int): Maximum number of concurrent workers
    
    Returns:
        list: List of analysis results
    """
    results = []
    
    # Use ThreadPoolExecutor for concurrent analysis
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all tasks
        future_to_url = {
            executor.submit(analyze_url_with_ai, url, model_path): url 
            for url in links
        }
        
        # Collect results as they complete
        for future in as_completed(future_to_url):
            url = future_to_url[future]
            try:
                result = future.result()
                results.append({
                    "url": url,
                    "analysis": result
                })
            except Exception as e:
                results.append({
                    "url": url,
                    "error": str(e)
                })
    
    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Analyze links with AI model")
    parser.add_argument("--links-file", type=str, help="JSON file containing links")
    parser.add_argument("--model", type=str, help="Path to model file")
    parser.add_argument("--max-workers", type=int, default=5, help="Maximum concurrent workers")
    
    args = parser.parse_args()
    
    # Read links from file or stdin
    if args.links_file:
        with open(args.links_file, 'r') as f:
            links_data = json.load(f)
            links = links_data.get("links", [])
    else:
        # Read from stdin
        input_data = sys.stdin.read()
        links_data = json.loads(input_data)
        links = links_data.get("links", [])
    
    if not links:
        print("No links to analyze", file=sys.stderr)
        sys.exit(1)
    
    # Analyze links
    results = analyze_links(links, args.model, args.max_workers)
    
    # Output results
    output = {
        "input_url": links_data.get("url", ""),
        "total_links": len(links),
        "analyzed_links": len(results),
        "results": results
    }
    
    print(json.dumps(output, indent=2))