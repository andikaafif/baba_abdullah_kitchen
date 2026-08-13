const path = require('path');
const fs = require('fs');

// Simple error logger
function logError(msg) {
  const logPath = path.join(__dirname, 'app-error.log');
  fs.appendFileSync(logPath, new Date().toISOString() + ' ' + msg + '\n');
}

try {
  const dotenv = require(path.join(__dirname, 'backend', 'node_modules', 'dotenv'));

  // Load env from backend/.env if present
  dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

  // Use express from backend/node_modules
  const express = require(path.join(__dirname, 'backend', 'node_modules', 'express'));
  const app = require('./backend/dist/app').default;

  // Serve frontend static files (but not index.html for missing paths)
  app.use(express.static(__dirname, { index: false }));

  // SPA fallback — serve index.html for non-API, non-uploads routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return next();
    }
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  // Passenger expects the app to be exported, not listening on a port
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
