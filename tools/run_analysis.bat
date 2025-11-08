@echo off
echo Starting website server...
cd website
start /b python -m http.server 8080
cd ..

echo Waiting for server to start...
timeout /t 3 /nobreak >nul

echo Running link analysis...
python analyze_website_simple.py --url http://localhost:8080 --output results.json

echo Stopping server...
taskkill /f /im python.exe /fi "WINDOWTITLE eq *http.server*"

echo Analysis complete. Results saved to results.json
pause