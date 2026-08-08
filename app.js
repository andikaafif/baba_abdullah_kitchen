const dotenv = require('dotenv');
const path = require('path');

// Load env from backend/.env if present
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const app = require('./backend/dist/app').default;
const express = require('express');

// Serve frontend static files
app.use(express.static(__dirname, { index: 'index.html' }));

// SPA fallback — serve index.html for non-API routes
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Passenger expects the app to be exported, not listening on a port
if (typeof PhusionPassenger !== 'undefined') {
  app.listen('passenger');
} else {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Running on port ${PORT}`));
}
