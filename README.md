# RedFlag

A website security analysis tool that inspects websites, URLs, and email content for threats such as phishing pages, malicious links, and malware. It combines a machine learning URL classifier with traditional link analysis and presents results through a web dashboard and a browser extension.

## What it does

- **Link analysis:** extracts links from a page (anchor tags, buttons with click handlers, data attributes) and classifies each as malicious or benign.
- **AI threat detection:** a scikit-learn Random Forest model trained on malicious/benign URL datasets scores URLs in real time.
- **Browser extension:** analyze the current page or a copied link from inside the browser (`extention/RedFlagExtention/`).
- **Web dashboard:** user accounts, analysis history, and detailed reports (`frontend/` + `backend/`).
- **Standalone scripts:** quick one-off website checks in `tools/` (for example `analyze_website.py`).

## Requirements

- Node.js 14 or newer (backend and frontend)
- Python 3.7 or newer (AI model and analysis scripts)
- A terminal, or [Visual Studio Code](https://code.visualstudio.com/)

## Install

### 1. Download the project

```bash
git clone https://github.com/kunal4060/Red_Flag.git
cd Red_Flag
```

### 2. Install backend dependencies

```bash
cd backend
npm install
pip install -r requirements.txt
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

## Usage

Start the backend API:

```bash
cd backend
npm run dev
```

Start the web dashboard (in a second terminal):

```bash
cd frontend
npm run dev
```

For a quick command-line website check without the full stack:

```bash
cd tools
python analyze_website.py
```

The browser extension can be loaded unpacked from `extention/RedFlagExtention/` in developer mode. Deeper write-ups live in `docs/` (architecture, extension guides, model integration notes).

## Project structure

```text
Red_Flag/
├── AI/           ← URL classifier: data, trained models, training scripts
├── backend/      ← Node.js API (package.json, src/)
├── frontend/     ← web dashboard (React/Vite-style app)
├── extention/    ← browser extension source
├── website/      ← static marketing pages (index, about, services, contact)
├── tools/        ← standalone analysis scripts
├── config/       ← Dockerfile and config files
└── docs/         ← architecture and integration guides
```

## License

Provided for learning and research purposes. No warranty is provided.
