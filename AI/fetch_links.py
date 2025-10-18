import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import sys
import json

def is_valid_url(url):
    """Check if URL is valid"""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def fetch_links(url, max_links=50):
    """
    Fetch all links from a webpage
    
    Args:
        url (str): The URL of the webpage to scrape
        max_links (int): Maximum number of links to fetch
    
    Returns:
        list: List of valid URLs found on the page
    """
    try:
        # Send GET request
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find all links
        links = []
        for link_tag in soup.find_all('a', href=True):
            href = link_tag['href']
            # Convert relative URLs to absolute
            absolute_url = urljoin(url, href)
            
            # Validate URL
            if is_valid_url(absolute_url):
                links.append(absolute_url)
                
                # Limit the number of links
                if len(links) >= max_links:
                    break
        
        # Remove duplicates while preserving order
        unique_links = list(dict.fromkeys(links))
        return unique_links
        
    except Exception as e:
        print(f"Error fetching links: {str(e)}", file=sys.stderr)
        return []

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python fetch_links.py <url>", file=sys.stderr)
        sys.exit(1)
    
    url = sys.argv[1]
    links = fetch_links(url)
    
    # Output as JSON
    print(json.dumps({
        "url": url,
        "links": links,
        "count": len(links)
    }))