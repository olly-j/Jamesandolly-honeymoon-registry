// server.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const UPLOADCARE_SECRET = 'your_secret_key_here';

app.get('/uploads', async (req, res) => {
  const response = await fetch('https://api.uploadcare.com/files/', {
    headers: {
      'Authorization': `Uploadcare.Simple your_public_key:${UPLOADCARE_SECRET}`,
      'Accept': 'application/json'
    }
  });
  const data = await response.json();
  const images = data.results
    .filter(file => file.is_image && file.is_ready)
    .map(file => file.cdn_url + '-/preview/-/quality/lightest/');
  res.json(images);
});

app.listen(3000, () => console.log('Gallery server running on port 3000'));