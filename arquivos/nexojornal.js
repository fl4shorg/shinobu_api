// nexojornal.js - Últimas notícias do Nexo (scraper da página principal)
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data } = await axios.get('https://www.nexojornal.com.br/ultimas', { timeout: 20000 });
    const $ = cheerio.load(data);

    const resultados = [];

    $('article').each((i, el) => {
      const titulo = $(el).find('h2, h3').first().text().trim();
      const link = $(el).find('a').first().attr('href');
      const imagem = $(el).find('img').first().attr('src');

      if (titulo && link) {
        resultados.push({
          "📰 Título": titulo,
          "🔗 Link": link,
          "🖼️ Imagem": imagem || null
        });
      }
    });

    return res.json({ status: 200, resultados });

  } catch (err) {
    return res.status(500).json({ status: 500, erro: `⚠️ ${err.message}` });
  }
});

module.exports = router;