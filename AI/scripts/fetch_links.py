import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import sys
import json
import re

def is_valid_url(url):
    """Check if URL is valid and not a data/javascript URL"""
    try:
        result = urlparse(url)
        # Filter out data URLs, javascript URLs, and anchor-only links
        if result.scheme in ['data', 'javascript', 'mailto', 'tel']:
            return False
        if url.startswith('#'):
            return False
        return all([result.scheme, result.netloc])
    except:
        return False

def extract_urls_from_text(text, base_url):
    """Extract URLs from text content (like CSS or JS)"""
    urls = []
    if not text:
        return urls
    
    # Pattern for URLs in quotes
    url_patterns = [
        r'url\(["\']?([^"\')]+)["\']?\)',  # CSS url()
        r'href=["\']([^"\'>]+)["\']',  # href attributes
        r'src=["\']([^"\'>]+)["\']',   # src attributes
        r'https?://[^\s\'"<>]+',         # Direct URLs
    ]
    
    for pattern in url_patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            absolute_url = urljoin(base_url, match)
            if is_valid_url(absolute_url):
                urls.append(absolute_url)
    
    return urls

def fetch_links(url, max_links=100):
    """
    Fetch all links from a webpage - enhanced version that scans ALL link elements
    
    Args:
        url (str): The URL of the webpage to scrape
        max_links (int): Maximum number of links to fetch
    
    Returns:
        list: List of valid URLs found on the page
    """
    try:
        # Send GET request
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        links = []
        
        # 1. Extract from <a> tags (anchor links)
        for tag in soup.find_all('a', href=True):
            href = str(tag['href'])
            absolute_url = urljoin(url, href)
            if is_valid_url(absolute_url):
                links.append(absolute_url)
        
        # 2. Extract from <link> tags (stylesheets, icons, etc.)
        for tag in soup.find_all('link', href=True):
            href = str(tag['href'])
            absolute_url = urljoin(url, href)
            if is_valid_url(absolute_url):
                links.append(absolute_url)
        
        # 3. Extract from <img> tags (src and srcset)
        for tag in soup.find_all('img'):
            # src attribute
            if tag.get('src'):
                absolute_url = urljoin(url, str(tag['src']))
                if is_valid_url(absolute_url):
                    links.append(absolute_url)
            # srcset attribute
            if tag.get('srcset'):
                srcset = str(tag['srcset'])
                # srcset can have multiple URLs with sizes
                for item in srcset.split(','):
                    src = item.strip().split()[0]
                    absolute_url = urljoin(url, src)
                    if is_valid_url(absolute_url):
                        links.append(absolute_url)
        
        # 4. Extract from <script> tags
        for tag in soup.find_all('script', src=True):
            absolute_url = urljoin(url, str(tag['src']))
            if is_valid_url(absolute_url):
                links.append(absolute_url)
        
        # 5. Extract from <iframe> tags
        for tag in soup.find_all('iframe', src=True):
            absolute_url = urljoin(url, str(tag['src']))
            if is_valid_url(absolute_url):
                links.append(absolute_url)
        
        # 6. Extract from <form> action attributes
        for tag in soup.find_all('form', action=True):
            absolute_url = urljoin(url, str(tag['action']))
            if is_valid_url(absolute_url):
                links.append(absolute_url)
        
        # 7. Extract from <area> tags (image maps)
        for tag in soup.find_all('area', href=True):
            absolute_url = urljoin(url, str(tag['href']))
            if is_valid_url(absolute_url):
                links.append(absolute_url)
        
        # 8. Extract from <base> tag
        base_tag = soup.find('base', href=True)
        if base_tag:
            absolute_url = urljoin(url, str(base_tag['href']))
            if is_valid_url(absolute_url):
                links.append(absolute_url)
        
        # 9. Extract from <meta> refresh redirects
        for tag in soup.find_all('meta'):
            http_equiv = tag.get('http-equiv', '')
            if isinstance(http_equiv, str) and http_equiv.lower() == 'refresh':
                content = str(tag.get('content', ''))
                # Pattern: "5;url=http://example.com"
                match = re.search(r'url=([^\s\'"]+)', content, re.IGNORECASE)
                if match:
                    absolute_url = urljoin(url, match.group(1))
                    if is_valid_url(absolute_url):
                        links.append(absolute_url)
        
        # 10. Extract from <video> and <audio> tags
        for tag in soup.find_all(['video', 'audio']):
            if tag.get('src'):
                absolute_url = urljoin(url, str(tag['src']))
                if is_valid_url(absolute_url):
                    links.append(absolute_url)
            # Also check <source> children
            for source in tag.find_all('source', src=True):
                absolute_url = urljoin(url, str(source['src']))
                if is_valid_url(absolute_url):
                    links.append(absolute_url)
        
        # 11. Extract from <embed> and <object> tags
        for tag in soup.find_all(['embed', 'object']):
            if tag.get('src'):
                absolute_url = urljoin(url, str(tag['src']))
                if is_valid_url(absolute_url):
                    links.append(absolute_url)
            if tag.get('data'):
                absolute_url = urljoin(url, str(tag['data']))
                if is_valid_url(absolute_url):
                    links.append(absolute_url)
        
        # 12. Extract from button elements with various patterns
        for button in soup.find_all('button'):
            # Check onclick attribute
            onclick = button.get('onclick', '')
            if onclick and isinstance(onclick, str):
                # Extract URLs from onclick (enhanced patterns)
                patterns = [
                    r'(?:window\.location|location\.href|window\.open)\s*(?:=|\()\s*["\']([^"\']*)["\']',
                    r'href\s*=\s*["\']([^"\']*)["\']',
                ]
                for pattern in patterns:
                    matches = re.findall(pattern, onclick)
                    for match in matches:
                        absolute_url = urljoin(url, match)
                        if is_valid_url(absolute_url):
                            links.append(absolute_url)
            
            # Check data attributes
            for attr in ['data-href', 'data-url', 'data-link', 'data-target', 'data-action']:
                href = button.get(attr)
                if href and isinstance(href, str):
                    absolute_url = urljoin(url, href)
                    if is_valid_url(absolute_url):
                        links.append(absolute_url)
        
        # 13. Extract from div/span with onclick (common in modern web apps)
        for tag in soup.find_all(['div', 'span'], onclick=True):
            onclick = tag['onclick']
            if onclick and isinstance(onclick, str):
                patterns = [
                    r'(?:window\.location|location\.href|window\.open)\s*(?:=|\()\s*["\']([^"\']*)["\']',
                ]
                for pattern in patterns:
                    matches = re.findall(pattern, onclick)
                    for match in matches:
                        absolute_url = urljoin(url, match)
                        if is_valid_url(absolute_url):
                            links.append(absolute_url)
        
        # 14. Extract URLs from inline CSS
        for style_tag in soup.find_all('style'):
            if style_tag.string:
                css_urls = extract_urls_from_text(style_tag.string, url)
                links.extend(css_urls)
        
        # 15. Extract from style attributes
        for tag in soup.find_all(style=True):
            css_urls = extract_urls_from_text(tag['style'], url)
            links.extend(css_urls)
        
        # 16. Extract from inline JavaScript
        for script_tag in soup.find_all('script'):
            if script_tag.string:
                js_urls = extract_urls_from_text(script_tag.string, url)
                links.extend(js_urls)
        
        # Remove duplicates while preserving order
        unique_links = list(dict.fromkeys(links))
        
        # Limit the number of links if necessary
        if len(unique_links) > max_links:
            unique_links = unique_links[:max_links]
        
        return unique_links
        
    except Exception as e:
        print(f"Error fetching links: {str(e)}", file=sys.stderr)
        return []

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python fetch_links.py <url> [max_links]", file=sys.stderr)
        sys.exit(1)
    
    url = sys.argv[1]
    max_links = int(sys.argv[2]) if len(sys.argv) > 2 else 100
    
    links = fetch_links(url, max_links)
    
    # Output as JSON
    output = {
        "url": url,
        "links": links,
        "count": len(links)
    }
    
    print(json.dumps(output, indent=2))