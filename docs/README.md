# RedFlag - Website Security Analysis Tool

RedFlag is a comprehensive security tool that analyzes websites, URLs, and email content to identify potential security threats like phishing attempts, malicious links, and malware.

## Project Structure

- **[frontend/](file:///c%3A/Users/Anikait/Documents/Coding%20Adventure/Hackathon/RedFlag/frontend)** - React-based web interface
- **[backend/](file:///c%3A/Users/Anikait/Documents/Coding%20Adventure/Hackathon/RedFlag/backend)** - Node.js API server
- **[AI/](file:///c%3A/Users/Anikait/Documents/Coding%20Adventure/Hackathon/RedFlag/AI)** - Machine learning models for URL classification
- **[extention/](file:///c%3A/Users/Anikait/Documents/Coding%20Adventure/Hackathon/RedFlag/extention)** - Browser extension
- **[website/](file:///c%3A/Users/Anikait/Documents/Coding%20Adventure/Hackathon/RedFlag/website)** - Test website for link analysis

## Features

### 1. Website Link Analysis
Analyze all links on a website for potential security threats:
- Fetch all links from any website
- Classify each link as malicious or benign using AI
- Generate detailed reports with risk scores

See [README_ANALYSIS.md](file:///c%3A/Users/Anikait/Documents/Coding%20Adventure/Hackathon/RedFlag/README_ANALYSIS.md) for detailed instructions.

### 2. Browser Extension
Real-time link analysis directly in your browser:
- Analyze copied links with AI
- Integration with VirusTotal for comprehensive scanning
- Instant security feedback

### 3. Web Interface
User-friendly dashboard for security analysis:
- Account management and authentication
- Security surveys and risk assessment
- Detailed analysis reports

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.7 or higher)
- MongoDB (for backend)
- Docker (optional, for containerization)

### Installation

1. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Set up your .env file
   npm start
   ```

3. **AI Model Setup:**
   ```bash
   pip install -r AI/requirements.txt
   ```

### Running Website Link Analysis

1. Start the test website:
   ```bash
   cd website
   python -m http.server 8080
   ```

2. Run the analysis:
   ```bash
   python analyze_website_simple.py --url http://localhost:8080
   ```

Or use the Windows batch file:
```bash
run_analysis.bat
```

## AI Model

The project uses a PyTorch-based CNN model for URL classification:
- Trained on a dataset of malicious and benign URLs
- Achieves high accuracy in detecting phishing and malware sites
- Lightweight and fast inference

Model files:
- [model.py](file:///c%3A/Users/Anikait/Documents/Coding%20Adventure/Hackathon/RedFlag/backend/AI/model.py) - Model architecture
- [run_inference.py](file:///c%3A/Users/Anikait/Documents/Coding%20Adventure/Hackathon/RedFlag/backend/AI/run_inference.py) - Inference script

## API Endpoints

The backend provides RESTful APIs for:
- User authentication
- AI-based URL analysis
- Survey management

## Browser Extension

The Chrome extension provides:
- Right-click context menu for link analysis
- Popup interface for manual URL checking
- Real-time security feedback

## Development

### Frontend
- Built with React and Vite
- Uses Tailwind CSS for styling
- State management with Zustand

### Backend
- Node.js with Express
- MongoDB for data storage
- JWT-based authentication

### AI
- PyTorch for model training and inference
- Beautiful Soup for web scraping
- Scikit-learn for data preprocessing

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](file:///c%3A/Users/Anikait/Documents/Coding%20Adventure/Hackathon/RedFlag/LICENSE) file for details.