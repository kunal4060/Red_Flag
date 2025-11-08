# %% [markdown]
# # Malicious URL Classifier (Keep full URLs)

# %% 
import os
from collections import Counter

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

from tqdm import tqdm
import matplotlib.pyplot as plt

from model import UrlClassifier

# ---- Constants ----
CSV_FILE = 'balanced_urls.csv'     # <-- your dataset
URL_COL = 'url'
LABEL_COL = 'label'
MAX_LEN = 200
BATCH_SIZE = 64
EMBED_DIM = 64
NUM_EPOCHS = 10
LR = 1e-3
DEVICE = torch.device('cpu')

# %% [markdown]
# ## 1️⃣ Load dataset
# %%
assert os.path.exists(CSV_FILE), f"CSV file not found: {CSV_FILE}"

df = pd.read_csv(CSV_FILE)
print('Columns:', df.columns.tolist())
print('Total rows:', len(df))
print(df.head())

print('\nLabel distribution:')
print(df[LABEL_COL].value_counts())

# %% [markdown]
# ## 2️⃣ Labels
# %%
unique_labels = df[LABEL_COL].unique().tolist()
print('\nUnique labels:', unique_labels)

label_map = {label: idx for idx, label in enumerate(sorted(unique_labels))}
df['label_id'] = df[LABEL_COL].map(label_map)
print('\nLabel map:', label_map)
print('\nLabel counts after mapping:')
print(df['label_id'].value_counts())

# %% [markdown]
# ## 3️⃣ Character vocabulary
# %%
counter = Counter()
for u in df[URL_COL]:
    counter.update(list(str(u)))

chars = sorted(counter.keys())
char2idx = {c: i + 2 for i, c in enumerate(chars)}
char2idx['<pad>'] = 0
char2idx['<unk>'] = 1
idx2char = {i: c for c, i in char2idx.items()}
vocab_size = max(char2idx.values()) + 1
print('\nVocab size:', vocab_size)

def url_to_seq(u, char2idx, max_len=MAX_LEN):
    seq = [char2idx.get(ch, char2idx['<unk>']) for ch in str(u)[:max_len]]
    if len(seq) < max_len:
        seq += [char2idx['<pad>']] * (max_len - len(seq))
    return seq

df['seq'] = df[URL_COL].apply(lambda u: url_to_seq(u, char2idx, MAX_LEN))
df = df[df[URL_COL].str.len() > 0].reset_index(drop=True)
print('Rows after cleaning:', len(df))

# %% [markdown]
# ## 4️⃣ Train-test split
# %%
train_df, test_df = train_test_split(df, test_size=0.2, stratify=df['label_id'], random_state=42)
print(f"Train: {len(train_df)}, Test: {len(test_df)}")

# %% 
class UrlDataset(Dataset):
    def __init__(self, df):
        self.seqs = df['seq'].tolist()
        self.labels = df['label_id'].astype(int).tolist()
    def __len__(self):
        return len(self.seqs)
    def __getitem__(self, idx):
        return (
            torch.tensor(self.seqs[idx], dtype=torch.long),
            torch.tensor(self.labels[idx], dtype=torch.long)
        )

train_loader = DataLoader(UrlDataset(train_df), batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(UrlDataset(test_df), batch_size=BATCH_SIZE)

# %% [markdown]
# ## 5️⃣ Model definition
# %%
num_classes = len(label_map)
model = UrlClassifier(vocab_size=vocab_size+1, embed_dim=EMBED_DIM, num_classes=num_classes).to(DEVICE)
print(model)

# %% [markdown]
# ## 6️⃣ Loss, optimizer
# %%
class_counts = df['label_id'].value_counts().sort_index().values
weights = torch.tensor([sum(class_counts)/c for c in class_counts], dtype=torch.float)
print('Class weights:', weights)

criterion = nn.CrossEntropyLoss(weight=weights)
optimizer = torch.optim.Adam(model.parameters(), lr=LR)

# %% [markdown]
# ## 7️⃣ Training loop
# %%
def train_one_epoch(model, loader, optimizer, criterion):
    model.train()
    total_loss, correct = 0, 0
    for x, y in tqdm(loader, desc='Train', leave=False):
        optimizer.zero_grad()
        logits = model(x)
        loss = criterion(logits, y)
        loss.backward()
        optimizer.step()

        total_loss += loss.item() * x.size(0)
        correct += (logits.argmax(1) == y).sum().item()
    return total_loss/len(loader.dataset), correct/len(loader.dataset)

def evaluate(model, loader, criterion):
    model.eval()
    total_loss, correct = 0, 0
    y_true, y_pred = [], []
    with torch.no_grad():
        for x, y in tqdm(loader, desc='Eval', leave=False):
            logits = model(x)
            loss = criterion(logits, y)
            total_loss += loss.item() * x.size(0)
            preds = logits.argmax(1)
            correct += (preds == y).sum().item()
            y_true.extend(y.numpy())
            y_pred.extend(preds.numpy())
    return total_loss/len(loader.dataset), correct/len(loader.dataset), y_true, y_pred

# %% [markdown]
# ## 8️⃣ Run training
# %%
history = {'train_loss': [], 'train_acc': [], 'val_loss': [], 'val_acc': []}

for epoch in range(NUM_EPOCHS):
    tr_loss, tr_acc = train_one_epoch(model, train_loader, optimizer, criterion)
    val_loss, val_acc, y_true, y_pred = evaluate(model, val_loader, criterion)
    history['train_loss'].append(tr_loss)
    history['train_acc'].append(tr_acc)
    history['val_loss'].append(val_loss)
    history['val_acc'].append(val_acc)
    print(f"Epoch {epoch+1}/{NUM_EPOCHS} | Train: {tr_loss:.4f}/{tr_acc:.4f} | Val: {val_loss:.4f}/{val_acc:.4f}")

# %% [markdown]
# ## 9️⃣ Plot training curves
# %%
plt.figure(figsize=(10,4))
plt.subplot(1,2,1)
plt.plot(history['train_loss'], label='Train Loss')
plt.plot(history['val_loss'], label='Val Loss')
plt.legend()
plt.title('Loss')

plt.subplot(1,2,2)
plt.plot(history['train_acc'], label='Train Acc')
plt.plot(history['val_acc'], label='Val Acc')
plt.legend()
plt.title('Accuracy')
plt.show()

# %% [markdown]
# ## 🔟 Final evaluation
# %%
print("\nClassification Report:")
print(classification_report(y_true, y_pred, digits=4))
cm = confusion_matrix(y_true, y_pred)
print("\nConfusion Matrix:\n", cm)

# %% [markdown]
# ## 💾 Save model
# %%
MODEL_PATH = 'url_cnn_cpu2.pth'
torch.save({
    'model_state_dict': model.state_dict(),
    'char2idx': char2idx,
    'vocab_size': vocab_size,
    'MAX_LEN': MAX_LEN,
    'label_map': label_map
}, MODEL_PATH)
print('✅ Saved model to', MODEL_PATH)

# %% [markdown]
# ## 🔍 Sample Inference
# %%
def predict_url(url, model, char2idx, max_len=MAX_LEN):
    model.eval()
    seq = url_to_seq(url, char2idx, max_len)
    x = torch.tensor([seq], dtype=torch.long)
    with torch.no_grad():
        logits = model(x)
        probs = nn.functional.softmax(logits, dim=1).cpu().numpy()[0]
        pred = int(np.argmax(probs))
    return pred, probs

sample_url = "https://www.example.com/login"
pred, probs = predict_url(sample_url, model, char2idx)
inv_label = {v: k for k, v in label_map.items()}
print(f"\nSample: {sample_url}\nPrediction: {inv_label[pred]} | Probabilities: {probs}")

# top-level training code should be guarded:
def main():
    # %% [markdown]
    # # Malicious URL Classifier (Keep full URLs)

    # %% 
    import os
    from collections import Counter

    import pandas as pd
    import numpy as np
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import classification_report, confusion_matrix

    import torch
    import torch.nn as nn
    from torch.utils.data import Dataset, DataLoader

    from tqdm import tqdm
    import matplotlib.pyplot as plt

    from model import UrlClassifier

    # ---- Constants ----
    CSV_FILE = 'balanced_urls.csv'     # <-- your dataset
    URL_COL = 'url'
    LABEL_COL = 'label'
    MAX_LEN = 200
    BATCH_SIZE = 64
    EMBED_DIM = 64
    NUM_EPOCHS = 10
    LR = 1e-3
    DEVICE = torch.device('cpu')

    # %% [markdown]
    # ## 1️⃣ Load dataset
    # %%
    assert os.path.exists(CSV_FILE), f"CSV file not found: {CSV_FILE}"

    df = pd.read_csv(CSV_FILE)
    print('Columns:', df.columns.tolist())
    print('Total rows:', len(df))
    print(df.head())

    print('\nLabel distribution:')
    print(df[LABEL_COL].value_counts())

    # %% [markdown]
    # ## 2️⃣ Labels
    # %%
    unique_labels = df[LABEL_COL].unique().tolist()
    print('\nUnique labels:', unique_labels)

    label_map = {label: idx for idx, label in enumerate(sorted(unique_labels))}
    df['label_id'] = df[LABEL_COL].map(label_map)
    print('\nLabel map:', label_map)
    print('\nLabel counts after mapping:')
    print(df['label_id'].value_counts())

    # %% [markdown]
    # ## 3️⃣ Character vocabulary
    # %%
    counter = Counter()
    for u in df[URL_COL]:
        counter.update(list(str(u)))

    chars = sorted(counter.keys())
    char2idx = {c: i + 2 for i, c in enumerate(chars)}
    char2idx['<pad>'] = 0
    char2idx['<unk>'] = 1
    idx2char = {i: c for c, i in char2idx.items()}
    vocab_size = max(char2idx.values()) + 1
    print('\nVocab size:', vocab_size)

    def url_to_seq(u, char2idx, max_len=MAX_LEN):
        seq = [char2idx.get(ch, char2idx['<unk>']) for ch in str(u)[:max_len]]
        if len(seq) < max_len:
            seq += [char2idx['<pad>']] * (max_len - len(seq))
        return seq

    df['seq'] = df[URL_COL].apply(lambda u: url_to_seq(u, char2idx, MAX_LEN))
    df = df[df[URL_COL].str.len() > 0].reset_index(drop=True)
    print('Rows after cleaning:', len(df))

    # %% [markdown]
    # ## 4️⃣ Train-test split
    # %%
    train_df, test_df = train_test_split(df, test_size=0.2, stratify=df['label_id'], random_state=42)
    print(f"Train: {len(train_df)}, Test: {len(test_df)}")

    # %% 
    class UrlDataset(Dataset):
        def __init__(self, df):
            self.seqs = df['seq'].tolist()
            self.labels = df['label_id'].astype(int).tolist()
        def __len__(self):
            return len(self.seqs)
        def __getitem__(self, idx):
            return (
                torch.tensor(self.seqs[idx], dtype=torch.long),
                torch.tensor(self.labels[idx], dtype=torch.long)
            )

    train_loader = DataLoader(UrlDataset(train_df), batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(UrlDataset(test_df), batch_size=BATCH_SIZE)

    # %% [markdown]
    # ## 5️⃣ Model definition
    # %%
    num_classes = len(label_map)
    model = UrlClassifier(vocab_size=vocab_size+1, embed_dim=EMBED_DIM, num_classes=num_classes).to(DEVICE)
    print(model)

    # %% [markdown]
    # ## 6️⃣ Loss, optimizer
    # %%
    class_counts = df['label_id'].value_counts().sort_index().values
    weights = torch.tensor([sum(class_counts)/c for c in class_counts], dtype=torch.float)
    print('Class weights:', weights)

    criterion = nn.CrossEntropyLoss(weight=weights)
    optimizer = torch.optim.Adam(model.parameters(), lr=LR)

    # %% [markdown]
    # ## 7️⃣ Training loop
    # %%
    def train_one_epoch(model, loader, optimizer, criterion):
        model.train()
        total_loss, correct = 0, 0
        for x, y in tqdm(loader, desc='Train', leave=False):
            optimizer.zero_grad()
            logits = model(x)
            loss = criterion(logits, y)
            loss.backward()
            optimizer.step()

            total_loss += loss.item() * x.size(0)
            correct += (logits.argmax(1) == y).sum().item()
        return total_loss/len(loader.dataset), correct/len(loader.dataset)

    def evaluate(model, loader, criterion):
        model.eval()
        total_loss, correct = 0, 0
        y_true, y_pred = [], []
        with torch.no_grad():
            for x, y in tqdm(loader, desc='Eval', leave=False):
                logits = model(x)
                loss = criterion(logits, y)
                total_loss += loss.item() * x.size(0)
                preds = logits.argmax(1)
                correct += (preds == y).sum().item()
                y_true.extend(y.numpy())
                y_pred.extend(preds.numpy())
        return total_loss/len(loader.dataset), correct/len(loader.dataset), y_true, y_pred

    # %% [markdown]
    # ## 8️⃣ Run training
    # %%
    history = {'train_loss': [], 'train_acc': [], 'val_loss': [], 'val_acc': []}

    for epoch in range(NUM_EPOCHS):
        tr_loss, tr_acc = train_one_epoch(model, train_loader, optimizer, criterion)
        val_loss, val_acc, y_true, y_pred = evaluate(model, val_loader, criterion)
        history['train_loss'].append(tr_loss)
        history['train_acc'].append(tr_acc)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(val_acc)
        print(f"Epoch {epoch+1}/{NUM_EPOCHS} | Train: {tr_loss:.4f}/{tr_acc:.4f} | Val: {val_loss:.4f}/{val_acc:.4f}")

    # %% [markdown]
    # ## 9️⃣ Plot training curves
    # %%
    plt.figure(figsize=(10,4))
    plt.subplot(1,2,1)
    plt.plot(history['train_loss'], label='Train Loss')
    plt.plot(history['val_loss'], label='Val Loss')
    plt.legend()
    plt.title('Loss')

    plt.subplot(1,2,2)
    plt.plot(history['train_acc'], label='Train Acc')
    plt.plot(history['val_acc'], label='Val Acc')
    plt.legend()
    plt.title('Accuracy')
    plt.show()

    # %% [markdown]
    # ## 🔟 Final evaluation
    # %%
    print("\nClassification Report:")
    print(classification_report(y_true, y_pred, digits=4))
    cm = confusion_matrix(y_true, y_pred)
    print("\nConfusion Matrix:\n", cm)

    # %% [markdown]
    # ## 💾 Save model
    # %%
    MODEL_PATH = 'url_cnn_cpu2.pth'
    torch.save({
        'model_state_dict': model.state_dict(),
        'char2idx': char2idx,
        'vocab_size': vocab_size,
        'MAX_LEN': MAX_LEN,
        'label_map': label_map
    }, MODEL_PATH)
    print('✅ Saved model to', MODEL_PATH)

    # %% [markdown]
    # ## 🔍 Sample Inference
    # %%
    def predict_url(url, model, char2idx, max_len=MAX_LEN):
        model.eval()
        seq = url_to_seq(url, char2idx, max_len)
        x = torch.tensor([seq], dtype=torch.long)
        with torch.no_grad():
            logits = model(x)
            probs = nn.functional.softmax(logits, dim=1).cpu().numpy()[0]
            pred = int(np.argmax(probs))
        return pred, probs

    sample_url = "https://www.example.com/login"
    pred, probs = predict_url(sample_url, model, char2idx)
    inv_label = {v: k for k, v in label_map.items()}
    print(f"\nSample: {sample_url}\nPrediction: {inv_label[pred]} | Probabilities: {probs}")

if __name__ == "__main__": main()
