// espn.js - Scraper ESPN Futebol 🏆
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

// Rota GET /espn
router.get('/', async (req, res) => {
  try {
    const url = 'https://www.espn.com.br/futebol/';
    const { data } = await axios.get(url, { timeout: 20000 });
    const $ = cheerio.load(data);

    const resultados = [];

    // Itera pelos campeonatos
    $('section').each((i, section) => {
      const campeonato = $(section).find('h2').first().text().trim();
      if (!campeonato) return; // ignora se não tiver campeonato

      $(section).find('article').each((j, article) => {
        const titulo = $(article).find('h2.contentItem__title').text().trim();
        const img = $(article).find('img.media-wrapper_image').attr('data-default-src') || null;
        const tempo = $(article).find('span.contentMeta__timestamp').text().trim();

        if (titulo) {
          resultados.push({
            "🏆 Campeonato": campeonato,
            "📰 Manchete": titulo,
            "🖼️ Imagem": img,
            "⏱️ Tempo": tempo
          });
        }
      });
    });

    return res.json({
      status: 200,
      resultados
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      erro: `⚠️ Falha ao buscar dados: ${err.message}`
    });
  }
});

module.exports = router;