const { spawn } = require('child_process');
const path = require('path');

// Start the development server
const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

// Handle cleanup
process.on('SIGINT', () => {
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
  process.exit(0);
});

console.log('Starting EdgeMarket Dev Server...');