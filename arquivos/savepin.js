// arquivos/SavePin.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

async function savePin(url) {
  try {
    const response = await axios.get(`https://www.savepin.app/download.php?url=${encodeURIComponent(url)}&lang=en&type=redirect`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });
    const html = response.data;
    const $ = cheerio.load(html);

    let results = [];
    $('td.video-quality').each((index, element) => {
      const type = $(element).text().trim();
      const format = $(element).next().text().trim();
      const downloadLinkElement = $(element).nextAll().find('#submiturl').attr('href');
      if (downloadLinkElement) {
        let downloadLink = downloadLinkElement;
        if (downloadLink.startsWith('force-save.php?url=')) {
          downloadLink = decodeURIComponent(downloadLink.replace('force-save.php?url=', ''));
        }
        results.push({ type, format, downloadLink });
      }
    });

    const title = $('h1').text().trim();
    return { success: true, title, results };
  } catch (error) {
    console.error("Error SavePin:", error.response ? error.response.data : error.message);
    return { success: false, message: error.message };
  }
}

// Rota Express
router.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ success: false, message: 'Parâmetro "url" é obrigatório' });

  const result = await savePin(url);
  res.json(result);
});

module.exports = router;