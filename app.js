const path = require('path');
const fs = require('fs');

// Passenger app root is this directory (backend/)
// Frontend files are in the parent directory
const frontendDir = path.join(__dirname, '..');

function logError(msg) {
  const logPath = path.join(__dirname, 'app-error.log');
  fs.appendFileSync(logPath, new Date().toISOString() + ' ' + msg + '\n');
}

try {
  const dotenv = require('dotenv');
  dotenv.config({ path: path.join(__dirname, '.env') });

  const express = require('express');
  const app = require('./dist/app').default;

  // Serve frontend static files from parent directory
  app.use(express.static(frontendDir, { index: false }));

  // SPA fallback — serve index.html for non-API, non-uploads routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return next();
    }
    res.sendFile(path.join(frontendDir, 'index.html'));
  });

  if (typeof PhusionPassenger !== 'undefined') {
    app.listen('passenger');
  } else {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Running on port ${PORT}`));
  }

  logError('App started successfully');
} catch (err) {
  logError('STARTUP ERROR: ' + err.stack);
  throw err;
}
