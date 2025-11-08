#!/usr/bin/env python3
"""
Script to analyze all links from a website using AI model
"""

import subprocess
import sys
import json
import time
import argparse
import os

def build_and_run_docker(image_name="test-website", container_name="test-website-container", port=8080):
    """
    Build and run the Docker container with the test website
    
    Args:
        image_name (str): Name for the Docker image
        container_name (str): Name for the Docker container
        port (int): Port to expose the container on
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Build the Docker image
        print(f"Building Docker image '{image_name}'...")
        build_result = subprocess.run([
            "docker", "build", 
            "-t", image_name,
            "."
        ], capture_output=True, text=True)
        
        if build_result.returncode != 0:
            print(f"Error building Docker image: {build_result.stderr}")
            return False
        
        # Stop and remove existing container if it exists
        print(f"Stopping existing container '{container_name}' if it exists...")
        subprocess.run([
            "docker", "stop", container_name
        ], capture_output=True)
        
        print(f"Removing existing container '{container_name}' if it exists...")
        subprocess.run([
            "docker", "rm", container_name
        ], capture_output=True)
        
        # Run the Docker container
        print(f"Running Docker container '{container_name}' on port {port}...")
        run_result = subprocess.run([
            "docker", "run", 
            "-d",  # Run in background
            "--name", container_name,
            "-p", f"{port}:80",
            image_name
        ], capture_output=True, text=True)
        
        if run_result.returncode != 0:
            print(f"Error running Docker container: {run_result.stderr}")
            return False
            
        print(f"Container '{container_name}' is running on http://localhost:{port}")
        return True
        
    except Exception as e:
        print(f"Error with Docker operations: {str(e)}")
        return False

def fetch_links(url):
    """
    Fetch links from a website using the fetch_links.py script
    
    Args:
        url (str): URL of the website to fetch links from
    
    Returns:
        dict: Links data or None if failed
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

def analyze_links(links_data, model_path=None):
    """
    Analyze links using the analyze_links.py script
    
    Args:
        links_data (dict): Data containing links to analyze
        model_path (str): Path to the model file
    
    Returns:
        dict: Analysis results or None if failed
    """
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        analyze_script = os.path.join(script_dir, "AI", "analyze_links.py")
        
        # Write links data to a temporary file
        temp_file = os.path.join(script_dir, "temp_links.json")
        with open(temp_file, 'w') as f:
            json.dump(links_data, f)
        
        print(f"Analyzing {len(links_data.get('links', []))} links with AI...")
        
        # Prepare command
        cmd = [sys.executable, analyze_script, "--links-file", temp_file]
        if model_path:
            cmd.extend(["--model", model_path])
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        
        # Clean up temporary file
        if os.path.exists(temp_file):
            os.remove(temp_file)
        
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            print(f"Error analyzing links: {result.stderr}")
            return None
    except Exception as e:
        print(f"Error analyzing links: {str(e)}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Analyze all links from a website using AI")
    parser.add_argument("--url", type=str, help="URL of the website to analyze")
    parser.add_argument("--build-docker", action="store_true", help="Build and run Docker container with test website")
    parser.add_argument("--docker-port", type=int, default=8080, help="Port for Docker container")
    parser.add_argument("--model", type=str, help="Path to model file")
    parser.add_argument("--output", type=str, help="Output file for results (JSON format)")
    
    args = parser.parse_args()
    
    # If --build-docker flag is set, build and run the Docker container
    if args.build_docker:
        print("Building and running Docker container with test website...")
        if not build_and_run_docker(port=args.docker_port):
            print("Failed to build and run Docker container")
            return 1
        
        # Wait a moment for the container to start
        print("Waiting for container to start...")
        time.sleep(5)
        
        # Set URL to the Docker container
        url = f"http://localhost:{args.docker_port}"
    elif args.url:
        url = args.url
    else:
        print("Please provide either --url or --build-docker flag")
        return 1
    
    # Fetch links from the website
    links_data = fetch_links(url)
    if not links_data:
        print("Failed to fetch links from website")
        return 1
    
    print(f"Found {links_data['count']} links on {links_data['url']}")
    
    # Analyze the links with AI
    results = analyze_links(links_data, args.model)
    if not results:
        print("Failed to analyze links with AI")
        return 1
    
    # Output results
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"Results saved to {args.output}")
    else:
        print(json.dumps(results, indent=2))
    
    # Print summary
    malicious_count = 0
    benign_count = 0
    
    for result in results.get("results", []):
        analysis = result.get("analysis", {})
        if "ai_result" in analysis:
            if analysis["ai_result"].get("label") == "malicious":
                malicious_count += 1
            else:
                benign_count += 1
    
    print(f"\nSummary:")
    print(f"  Total links analyzed: {results.get('analyzed_links', 0)}")
    print(f"  Malicious links: {malicious_count}")
    print(f"  Benign links: {benign_count}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())