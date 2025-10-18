# run_inference.py
import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))  # ensure model.py is found
from model import UrlClassifier

import torch
import argparse
import json

# -------------------------
# Parse arguments
# -------------------------
default_model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "url_cnn_cpu2.pth")

parser = argparse.ArgumentParser()
parser.add_argument("--url", type=str, required=True, help="URL to analyze")
parser.add_argument("--model", type=str, default=default_model_path, help="Path to checkpoint")
args = parser.parse_args()
url = args.url

# -------------------------
# Load checkpoint
# -------------------------
checkpoint = torch.load(args.model, map_location="cpu")

# Extract metadata
char2idx = checkpoint.get("char2idx", {})
MAX_LEN = checkpoint.get("MAX_LEN", 200)
vocab_size = checkpoint["model_state_dict"]["embedding.weight"].shape[0]
embed_dim = checkpoint["model_state_dict"]["embedding.weight"].shape[1]
num_classes = 2  # adjust if your model had more

# -------------------------
# Recreate model
# -------------------------
model = UrlClassifier(vocab_size=vocab_size, embed_dim=embed_dim, num_classes=num_classes)
model.load_state_dict(checkpoint["model_state_dict"])
model.eval()

# -------------------------
# Preprocess URL → tensor
# -------------------------
def encode_url(u, char2idx, max_len):
    tokens = [char2idx.get(c, char2idx.get("<UNK>", 1)) for c in u[:max_len]]
    pad_len = max_len - len(tokens)
    tokens += [0] * pad_len  # pad with 0 (embedding padding_idx)
    return torch.tensor([tokens], dtype=torch.long)

x = encode_url(url, char2idx, MAX_LEN)

# -------------------------
# Run inference
# -------------------------
with torch.no_grad():
    logits = model(x)
    probs = torch.softmax(logits, dim=1)
    score = float(probs[0, 1])  # probability of malicious
    label = "malicious" if score > 0.5 else "benign"

# -------------------------
# Output JSON only
# -------------------------
print(json.dumps({
    "ai_result": {
        "label": label,
        "score": score
    }
}))
