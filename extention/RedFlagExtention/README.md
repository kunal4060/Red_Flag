# RedFlag Browser Extension

A browser extension for analyzing URLs and websites for potential security threats.

## Features

1. **AI Analysis** - Analyze copied links with the RedFlag AI model
2. **Deep Analysis** - Scan links with VirusTotal's comprehensive engine
3. **Insight Analysis** - Analyze all links on the current website for security threats

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

## Usage

### AI Analysis
1. Copy a URL to your clipboard
2. Click "Run AI Analysis" in the extension popup
3. View the AI classification result (malicious/benign) with confidence score

### Deep Analysis
1. Copy a URL to your clipboard
2. Click "Run Deep Analysis" in the extension popup
3. View comprehensive scan results from multiple security engines

### Insight Analysis
1. Navigate to any website
2. Click "Insight Analysis" in the extension popup
3. View live analysis of all links on the current page:
   - Total links found
   - Number of malicious vs benign links
   - Detailed breakdown of each link's classification

## Permissions

- `activeTab` - To analyze the current website
- `storage` - For future feature enhancements
- `notifications` - To display analysis results
- Access to `http://localhost/*` - For communication with the backend
- Access to `https://www.virustotal.com/*` - For VirusTotal scans

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build

### Project Structure

- `src/` - React components and application logic
- `public/` - Static assets and manifest file
- `background.js` - Background script for handling API requests
- `Popup.jsx` - Main popup UI component

## API Integration

The extension communicates with two services:

1. **RedFlag Backend** (`http://localhost:5001`) - For AI analysis and website scanning
2. **VirusTotal API** (`https://www.virustotal.com`) - For deep security scanning

Make sure the RedFlag backend is running for full functionality.