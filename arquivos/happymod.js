const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');

puppeteer.use(StealthPlugin());

// Função de scraping
async function scrape(search) {
  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.goto(`https://id.happymod.cloud/search.html?q=${encodeURIComponent(search)}`, {
      waitUntil: 'domcontentloaded',
    });

    const htmlContent = await page.content();
    const $ = cheerio.load(htmlContent);
    const applications = [];

    $('.col-12.col-md-6.col-xl-4.mb-3').each((_, element) => {
      const $element = $(element);
      const title = $element.find('h3.h6').text().trim();
      const link = $element.find('a.archive-post').attr('href');
      const image = $element.find('img.lozad').attr('data-src') || $element.find('img.lozad').attr('src');
      const version = $element.find('div.small.text-truncate.text-muted span.align-middle').eq(0).text().trim();
      const fileSize = $element.find('div.small.text-truncate.text-muted span.align-middle').eq(1).text().trim();
      const modFeatures = $element.find('div.small.text-truncate.text-muted').last().text().trim();

      applications.push({
        title,
        link: link ? `https://apkcombo.com${link}` : null,
        image: image || null,
        version,
        fileSize,
        modFeatures: modFeatures === version || modFeatures.includes('+') ? 'N/A' : modFeatures,
      });
    });

    await browser.close();
    return applications;
  } catch (error) {
    console.error('API Error:', error.message);
    throw new Error('Failed to get response from API');
  }
}

// GET endpoint
router.get('/', async (req, res) => {
  const { search } = req.query || {};

  if (!search || typeof search !== 'string' || search.trim().length === 0) {
    return res.status(400).json({ status: false, error: "Parameter 'search' is required" });
  }

  if (search.length > 255) {
    return res.status(400).json({ status: false, error: "Parameter 'search' must be less than 255 characters" });
  }

  try {
    const applications = await scrape(search.trim());
    res.json({ status: true, data: applications, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message || 'Internal Server Error' });
  }
});

// POST endpoint
router.post('/', async (req, res) => {
  const { search } = req.body || {};

  if (!search || typeof search !== 'string' || search.trim().length === 0) {
    return res.status(400).json({ status: false, error: "Parameter 'search' is required" });
  }

  if (search.length > 255) {
    return res.status(400).json({ status: false, error: "Parameter 'search' must be less than 255 characters" });
  }

  try {
    const applications = await scrape(search.trim());
    res.json({ status: true, data: applications, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message || 'Internal Server Error' });
  }
});

module.exports = router;