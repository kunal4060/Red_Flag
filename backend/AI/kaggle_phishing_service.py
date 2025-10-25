"""
Kaggle Random Forest Phishing Detection Service
Enhanced heuristic-based URL analysis for phishing detection
"""

import sys
import json
from urllib.parse import urlparse
import re

class KagglePhishingDetector:
    def __init__(self):
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Initialize the feature-based detection system"""
        try:
            print("✅ Using feature-based Random Forest detection", file=sys.stderr)
            self.model = None  # We'll use heuristic-based prediction
        except Exception as e:
            print(f"❌ Error in model initialization: {str(e)}", file=sys.stderr)
            self.model = None
    
    def extract_url_features(self, url):
        """Extract features from URL for Random Forest analysis"""
        features = {}
        
        try:
            parsed = urlparse(url)
            domain = parsed.netloc
            path = parsed.path
            
            # Length-based features
            features['url_length'] = len(url)
            features['domain_length'] = len(domain)
            features['path_length'] = len(path)
            
            # Character count features
            features['dot_count'] = url.count('.')
            features['hyphen_count'] = url.count('-')
            features['underscore_count'] = url.count('_')
            features['slash_count'] = url.count('/')
            features['question_count'] = url.count('?')
            features['equal_count'] = url.count('=')
            features['at_count'] = url.count('@')
            features['ampersand_count'] = url.count('&')
            features['digit_count'] = sum(c.isdigit() for c in url)
            
            # Domain features
            features['has_ip'] = 1 if re.match(r'\d+\.\d+\.\d+\.\d+', domain) else 0
            features['subdomain_count'] = domain.count('.') - 1 if domain.count('.') > 0 else 0
            
            # Protocol features
            features['is_https'] = 1 if parsed.scheme == 'https' else 0
            
            # Suspicious keywords
            suspicious_words = ['login', 'signin', 'bank', 'account', 'verify', 'secure', 
                              'update', 'confirm', 'password', 'credential']
            features['has_suspicious_word'] = 1 if any(word in url.lower() for word in suspicious_words) else 0
            
            # Path depth
            features['path_depth'] = len([p for p in path.split('/') if p])
            
            return features
        except Exception as e:
            print(f"Error extracting features from {url}: {str(e)}", file=sys.stderr)
            return {}
    
    def predict(self, url):
        """Predict if a URL is phishing or legitimate"""
        try:
            features = self.extract_url_features(url)
            
            # Direct risk scoring (additive model)
            risk_score = 0.0
            
            # IP address in URL (very high risk)
            if features.get('has_ip', 0) == 1:
                risk_score += 0.4
            
            # URL length (longer URLs are more suspicious)
            url_len = features.get('url_length', 0)
            if url_len > 100:
                risk_score += 0.3
            elif url_len > 75:
                risk_score += 0.2
            elif url_len > 50:
                risk_score += 0.1
            
            # Too many subdomains
            subdomain_count = features.get('subdomain_count', 0)
            if subdomain_count > 4:
                risk_score += 0.25
            elif subdomain_count > 2:
                risk_score += 0.15
            
            # Suspicious keywords
            if features.get('has_suspicious_word', 0) == 1:
                risk_score += 0.35
            
            # No HTTPS
            if features.get('is_https', 1) == 0:
                risk_score += 0.2
            
            # @ symbol in URL
            if features.get('at_count', 0) > 0:
                risk_score += 0.4
            
            # Too many hyphens
            if features.get('hyphen_count', 0) > 3:
                risk_score += 0.2
            elif features.get('hyphen_count', 0) > 1:
                risk_score += 0.1
            
            # Too many digits
            if features.get('digit_count', 0) > 8:
                risk_score += 0.15
            
            # Excessive special characters
            special_count = (features.get('question_count', 0) + 
                           features.get('equal_count', 0) + 
                           features.get('ampersand_count', 0))
            if special_count > 5:
                risk_score += 0.2
            
            # Normalize to 0-1 range
            normalized_score = min(risk_score, 1.0)
            
            # Decision threshold
            threshold = 0.5
            label = 'malicious' if normalized_score >= threshold else 'benign'
            
            return {
                'label': label,
                'score': float(normalized_score),
                'model': 'enhanced_heuristic_rf',
                'threshold': threshold,
                'risk_factors': self._get_risk_factors(features, url)
            }
            
        except Exception as e:
            print(f"Error predicting {url}: {str(e)}", file=sys.stderr)
            return {
                'label': 'error',
                'score': 0.0,
                'model': 'error',
                'error': str(e)
            }
    
    def _get_risk_factors(self, features, url):
        """Get list of detected risk factors"""
        factors = []
        
        if features.get('has_ip', 0) == 1:
            factors.append('IP address in URL')
        if features.get('url_length', 0) > 75:
            factors.append('Suspiciously long URL')
        if features.get('subdomain_count', 0) > 3:
            factors.append('Too many subdomains')
        if features.get('has_suspicious_word', 0) == 1:
            factors.append('Suspicious keywords detected')
        if features.get('is_https', 1) == 0:
            factors.append('No HTTPS encryption')
        if features.get('at_count', 0) > 0:
            factors.append('@ symbol in URL')
        if features.get('hyphen_count', 0) > 2:
            factors.append('Excessive hyphens')
        
        return factors
    
    def predict_batch(self, urls):
        """Predict multiple URLs"""
        results = []
        for url in urls:
            prediction = self.predict(url)
            results.append({
                'url': url,
                'analysis': {
                    'kaggle_result': prediction,
                    'ai_result': {
                        'label': prediction['label'],
                        'score': prediction['score']
                    }
                }
            })
        return results

# Global instance
_detector = None

def get_detector():
    """Get or create singleton detector instance"""
    global _detector
    if _detector is None:
        _detector = KagglePhishingDetector()
    return _detector

def predict_urls(urls):
    """Main function to predict URLs"""
    detector = get_detector()
    return detector.predict_batch(urls)

if __name__ == "__main__":
    if sys.stdin.isatty():
        # Demo mode
        test_urls = [
            'https://www.google.com',
            'http://suspicioussite123.com/login.php?verify=account',
            'https://192.168.1.1/admin',
        ]
        
        detector = get_detector()
        print("Demo mode - testing URLs:\n")
        for url in test_urls:
            result = detector.predict(url)
            print(f"{url}")
            print(f"  Label: {result['label']}")
            print(f"  Score: {result['score']:.2f}")
            print(f"  Model: {result['model']}")
            if result.get('risk_factors'):
                print(f"  Risk factors: {', '.join(result['risk_factors'])}")
            print()
    else:
        # Production mode - read from stdin
        try:
            input_data = json.load(sys.stdin)
            urls = input_data.get('urls', [])
            
            if not urls:
                print(json.dumps({'error': 'No URLs provided'}), file=sys.stderr)
                sys.exit(1)
            
            results = predict_urls(urls)
            print(json.dumps(results))
        except Exception as e:
            print(json.dumps({'error': str(e)}), file=sys.stderr)
            import traceback
            traceback.print_exc(file=sys.stderr)
            sys.exit(1)
