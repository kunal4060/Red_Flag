import torch
import torch.nn as nn
import numpy as np
import sys
import os

# ---- Constants ----
MODEL_PATH = 'url_cnn_full.pth'
DEVICE = torch.device('cpu')
MAX_LEN = 200  # default, will be overwritten by saved model

# ---- URL sequence function ----
def url_to_seq(u, char2idx, max_len=MAX_LEN):
    seq = [char2idx.get(ch, char2idx.get('<unk>', 1)) for ch in str(u)[:max_len]]
    if len(seq) < max_len:
        seq += [char2idx.get('<pad>', 0)] * (max_len - len(seq))
    return seq

# ---- Model definition ----
class UrlClassifier(nn.Module):
    def __init__(self, vocab_size, embed_dim=64, num_classes=2):
        super().__init__()
        self.embedding = nn.Embedding(num_embeddings=vocab_size, embedding_dim=embed_dim, padding_idx=0)
        self.conv = nn.Conv1d(embed_dim, 128, kernel_size=5, padding=2)
        self.pool = nn.AdaptiveMaxPool1d(1)
        self.fc = nn.Linear(128, num_classes)
        self.dropout = nn.Dropout(0.3)

    def forward(self, x):
        emb = self.embedding(x)
        emb = emb.permute(0, 2, 1)
        conv = self.conv(emb)
        pooled = self.pool(conv).squeeze(-1)
        out = self.dropout(pooled)
        return self.fc(out)

# ---- Load model ----
if not os.path.exists(MODEL_PATH):
    print(f"Error: Model file not found at {MODEL_PATH}")
    sys.exit(1)

checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)
char2idx = checkpoint['char2idx']
label_map = checkpoint['label_map']
vocab_size = checkpoint['vocab_size']
MAX_LEN = checkpoint['MAX_LEN']

num_classes = len(label_map)
model = UrlClassifier(vocab_size=vocab_size+1, embed_dim=64, num_classes=num_classes).to(DEVICE)
model.load_state_dict(checkpoint['model_state_dict'])
model.eval()

# ---- Inverse label map ----
inv_label = {v: k for k, v in label_map.items()}

# ---- Prediction function ----
def predict_url(url):
    seq = url_to_seq(url, char2idx, MAX_LEN)
    x = torch.tensor([seq], dtype=torch.long).to(DEVICE)
    with torch.no_grad():
        logits = model(x)
        probs = nn.functional.softmax(logits, dim=1).cpu().numpy()[0]
        pred = int(np.argmax(probs))
    return inv_label[pred], probs

# ---- Main ----
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python check.py <URL>")
        sys.exit(0)

    url = sys.argv[1]
    label, probs = predict_url(url)
    print(f"\nURL: {url}")
    print(f"Prediction: {label}")
    print(f"Probabilities: {probs}")
