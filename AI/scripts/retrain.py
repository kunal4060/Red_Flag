import torch
from model import UrlClassifier

# Load checkpoint
checkpoint = torch.load("url_cnn_cpu2.pth", map_location="cpu")
print("Checkpoint vocab_size field:", checkpoint.get("vocab_size"))
print("Actual embedding weight shape in checkpoint:", checkpoint["model_state_dict"]["embedding.weight"].shape)

# Extract actual vocab size from the embedding tensor itself
actual_vocab_size = checkpoint["model_state_dict"]["embedding.weight"].shape[0]
embed_dim = checkpoint["model_state_dict"]["embedding.weight"].shape[1]
num_classes = 2
max_len = checkpoint.get("MAX_LEN", 200)

# Instantiate model using actual size
model = UrlClassifier(vocab_size=actual_vocab_size, embed_dim=embed_dim, num_classes=num_classes)

# Load weights
model.load_state_dict(checkpoint["model_state_dict"], strict=True)
model.eval()

# Save model
torch.save(model, "url_cnn_full.pth")

# Export scripted version
example_input = torch.zeros((1, max_len), dtype=torch.long)
traced = torch.jit.trace(model, example_input)
traced.save("url_cnn_scripted.pt")

print(f"✅ Model loaded successfully with vocab_size={actual_vocab_size}, embed_dim={embed_dim}, MAX_LEN={max_len}")
