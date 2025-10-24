"""
Persistent AI Inference Service
Loads the model once and keeps it in memory for fast repeated inference
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from model import UrlClassifier
import torch
import json

class InferenceService:
    """Singleton service for AI inference"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(InferenceService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        # Load model on initialization
        default_model_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)), 
            "url_cnn_cpu2.pth"
        )
        
        self.model_path = default_model_path
        self.model = None
        self.char2idx = None
        self.MAX_LEN = None
        
        self._load_model()
        self._initialized = True
    
    def _load_model(self):
        """Load the model and metadata"""
        try:
            # Load checkpoint
            checkpoint = torch.load(self.model_path, map_location="cpu")
            
            # Extract metadata
            self.char2idx = checkpoint.get("char2idx", {})
            self.MAX_LEN = checkpoint.get("MAX_LEN", 200)
            vocab_size = checkpoint["model_state_dict"]["embedding.weight"].shape[0]
            embed_dim = checkpoint["model_state_dict"]["embedding.weight"].shape[1]
            num_classes = 2
            
            # Recreate model
            self.model = UrlClassifier(
                vocab_size=vocab_size, 
                embed_dim=embed_dim, 
                num_classes=num_classes
            )
            self.model.load_state_dict(checkpoint["model_state_dict"])
            self.model.eval()
            
            print(f"[InferenceService] Model loaded successfully from {self.model_path}", file=sys.stderr)
        except Exception as e:
            print(f"[InferenceService] Error loading model: {e}", file=sys.stderr)
            raise
    
    def _encode_url(self, url):
        """Encode URL to tensor"""
        if self.char2idx is None or self.MAX_LEN is None:
            raise ValueError("Model not properly initialized")
            
        tokens = [
            self.char2idx.get(c, self.char2idx.get("<UNK>", 1)) 
            for c in url[:self.MAX_LEN]
        ]
        pad_len = self.MAX_LEN - len(tokens)
        tokens += [0] * pad_len
        return torch.tensor([tokens], dtype=torch.long)
    
    def predict(self, url):
        """
        Predict whether a URL is malicious or benign
        
        Args:
            url (str): URL to analyze
            
        Returns:
            dict: Prediction result with label and score
        """
        if self.model is None:
            return {"error": "Model not loaded"}
        
        try:
            # Encode URL
            x = self._encode_url(url)
            
            # Run inference
            with torch.no_grad():
                logits = self.model(x)
                probs = torch.softmax(logits, dim=1)
                score = float(probs[0, 1])  # probability of malicious
                label = "malicious" if score > 0.5 else "benign"
            
            return {
                "ai_result": {
                    "label": label,
                    "score": score
                }
            }
        except Exception as e:
            return {"error": str(e)}
    
    def predict_batch(self, urls):
        """
        Predict multiple URLs in batch for efficiency
        
        Args:
            urls (list): List of URLs to analyze
            
        Returns:
            list: List of prediction results
        """
        if self.model is None:
            return [{"error": "Model not loaded"} for _ in urls]
        
        results = []
        try:
            # Encode all URLs
            tensors = [self._encode_url(url) for url in urls]
            batch = torch.cat(tensors, dim=0)
            
            # Run batch inference
            with torch.no_grad():
                logits = self.model(batch)
                probs = torch.softmax(logits, dim=1)
                
                for i, url in enumerate(urls):
                    score = float(probs[i, 1])
                    label = "malicious" if score > 0.5 else "benign"
                    results.append({
                        "ai_result": {
                            "label": label,
                            "score": score
                        }
                    })
        except Exception as e:
            results = [{"error": str(e)} for _ in urls]
        
        return results


# CLI interface for compatibility with existing scripts
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", type=str, help="Single URL to analyze")
    parser.add_argument("--batch", type=str, help="JSON string of URLs to analyze in batch")
    parser.add_argument("--interactive", action="store_true", help="Run in interactive mode (stdin/stdout)")
    args = parser.parse_args()
    
    # Initialize service
    service = InferenceService()
    
    if args.interactive:
        # Interactive mode: read URLs from stdin, write results to stdout
        print("[InferenceService] Ready for requests", file=sys.stderr, flush=True)
        
        for line in sys.stdin:
            try:
                request = json.loads(line.strip())
                url = request.get('url')
                if url:
                    result = service.predict(url)
                    print(json.dumps(result), flush=True)
                else:
                    print(json.dumps({"error": "No URL in request"}), flush=True)
            except json.JSONDecodeError:
                print(json.dumps({"error": "Invalid JSON"}), flush=True)
            except Exception as e:
                print(json.dumps({"error": str(e)}), flush=True)
    
    elif args.url:
        # Single URL prediction
        result = service.predict(args.url)
        print(json.dumps(result))
    elif args.batch:
        # Batch prediction
        urls = json.loads(args.batch)
        results = service.predict_batch(urls)
        print(json.dumps(results))
    else:
        print(json.dumps({"error": "No URL or batch provided"}))
