const http = require('http');

// Simple test to directly call the Python script
const { spawn } = require('child_process');
const path = require('path');

console.log('Testing website analysis script directly...');

const projectRoot = path.join(__dirname, '..');
const scriptPath = path.join(projectRoot, 'backend', 'website_analysis.py');

console.log('Script path:', scriptPath);

const py = spawn('python', [scriptPath, '--url', 'http://localhost:8080'], {
  cwd: projectRoot
});

let stdout = '';
let stderr = '';

py.stdout.on('data', (data) => {
  stdout += data.toString();
  console.log('stdout chunk:', data.toString());
});

py.stderr.on('data', (data) => {
  stderr += data.toString();
  console.log('stderr chunk:', data.toString());
});

py.on('close', (code) => {
  console.log('Process exited with code:', code);
  console.log('Full stdout:', stdout);
  console.log('Full stderr:', stderr);
  
  if (code === 0) {
    try {
      const result = JSON.parse(stdout.trim());
      console.log('Parsed result:', JSON.stringify(result, null, 2));
    } catch (e) {
      console.error('Failed to parse JSON:', e);
    }
  }
});