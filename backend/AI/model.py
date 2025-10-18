import torch.nn as nn

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