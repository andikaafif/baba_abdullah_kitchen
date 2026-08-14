const path = require('path');
const fs = require('fs');
const http = require('http');

// Passenger app root is this directory (backend/)
const frontendDir = path.join(__dirname, '..');

function logError(msg) {
  const logPath = path.join(__dirname, 'app-error.log');
  fs.appendFileSync(logPath, new Date().toISOString() + ' ' + msg + '\n');
}

logError('app.js is executing');

try {
  const dotenv = require('dotenv');
  logError('dotenv loaded');
  dotenv.config({ path: path.join(__dirname, '.env') });
  logError('dotenv configured');

  const express = require('express');
  logError('express loaded');

  const backendApp = require('./dist/app').default;
  logError('backend app loaded');

  // Serve frontend static files from parent directory
  backendApp.use(express.static(frontendDir, { index: false }));

  // SPA fallback
  backendApp.use((req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return next();
    }
    res.sendFile(path.join(frontendDir, 'index.html'));
  });

  if (typeof PhusionPassenger !== 'undefined') {
    backendApp.listen('passenger');
  } else {
    const PORT = process.env.PORT || 3000;
    backendApp.listen(PORT, () => console.log(`Running on port ${PORT}`));
  }

  logError('App started successfully');
} catch (err) {
  logError('STARTUP ERROR: ' + err.stack);

  // Serve a simple error page so we can see the error
  const errorApp = http.createServer((req, res) => {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message, stack: err.stack }));
  });

  if (typeof PhusionPassenger !== 'undefined') {
    errorApp.listen('passenger');
  } else {
    errorApp.listen(3000);
  }
}
