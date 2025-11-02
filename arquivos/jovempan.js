const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

// 📡 GET /api/jovempan → retorna últimas notícias
router.get('/', async (req, res) => {
  try {
    const url = 'https://jovempan.com.br/';
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const results = [];

    $('a.item').each((i, el) => {
      const link = $(el).attr('href');
      const title = $(el).find('p.title').text().trim();
      const author = $(el).find('h6.category').text().trim();
      let image = $(el).find('img').attr('src');

      // Corrige imagem relativa
      if (image && !image.startsWith('http')) {
        image = 'https://jovempan.com.br' + image;
      }

      if (title && link) {
        results.push({
          author,
          title,
          image: image || null,
          link
        });
      }
    });

    if (!results.length)
      return res.status(404).json({ status: false, message: 'Nenhuma notícia encontrada.' });

    res.json({
      status: 200,
      source: 'Jovem Pan',
      total: results.length,
      results
    });

  } catch (err) {
    console.error('Erro ao buscar notícias da Jovem Pan:', err.message);
    res.status(500).json({ status: false, message: 'Erro interno ao buscar notícias.', error: err.message });
  }
});

module.exports = router;