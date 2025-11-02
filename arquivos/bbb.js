const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

// 📰 GET /api/bbb → retorna notícias do BBB
router.get('/', async (req, res) => {
  try {
    const url = 'https://gshow.globo.com/realities/bbb/';
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const results = [];

    $('div[type="materia"]').each((i, el) => {
      const img = $(el).find('img').attr('src');
      const title = $(el).find('img').attr('alt');
      const link = $(el).find('a').attr('href') || url;

      if (title && img) {
        results.push({
          title: title.trim(),
          image: img.startsWith('http') ? img : `https:${img}`,
          link: link.startsWith('http') ? link : `https://gshow.globo.com${link}`
        });
      }
    });

    if (!results.length) {
      return res.status(404).json({ status: false, message: 'Nenhuma notícia encontrada' });
    }

    res.json({
      status: 200,
      source: 'Gshow BBB',
      total: results.length,
      results
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: false, message: 'Erro ao buscar notícias do BBB', error: err.message });
  }
});

module.exports = router;