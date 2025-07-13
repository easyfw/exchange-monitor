const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

console.log('Kakao Client ID configured:', process.env.KAKAO_CLIENT_ID ? 'YES' : 'NO');
console.log('Kakao Redirect URI configured:', process.env.KAKAO_REDIRECT_URI ? 'YES' : 'NO');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic exchange rate API (simplified)
app.get('/api/rates', async (req, res) => {
  try {
    // Mock data for Railway deployment
    const rates = [
      { id: 1, currencyPair: 'USD/KRW', rate: '1379.5', timestamp: new Date().toISOString() },
      { id: 2, currencyPair: 'JPY/KRW', rate: '9.3557', timestamp: new Date().toISOString() },
      { id: 3, currencyPair: 'USD/JPY', rate: '147.45', timestamp: new Date().toISOString() }
    ];
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rates' });
  }
});

// Basic alerts API
app.get('/api/alerts', (req, res) => {
  res.json([]);
});

app.get('/api/alerts/check', (req, res) => {
  res.json([]);
});

// Basic settings API
app.get('/api/settings/:key', (req, res) => {
  if (req.params.key === 'updateInterval') {
    res.json({ id: 1, key: 'updateInterval', value: '30' });
  } else if (req.params.key === 'showLogs') {
    res.json({ id: 7, key: 'showLogs', value: 'false' });
  } else {
    res.status(404).json({ error: 'Setting not found' });
  }
});

// Serve static files from dist/public
const distPath = path.resolve(__dirname, 'public');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Catch-all handler for SPA
app.get('*', (req, res) => {
  const indexPath = path.resolve(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Exchange Monitor - File not found');
  }
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Exchange Monitor Server running on port ${port}`);
});