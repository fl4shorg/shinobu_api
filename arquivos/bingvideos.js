const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

router.get('/', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json({ error: 'Faltando parâmetro: q' });

  try {
    const url = `https://www.bing.com/videos/search?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
    });

    const $ = cheerio.load(data);
    const resultados = [];

    $('div.mc_vtvc_con_rc').each((i, el) => {
      const link = $(el).attr('ourl');
      const thumb = $(el).find('img').attr('src');
      const titulo = $(el).find('img').attr('alt');
      const canal = $(el).find('.mc_vtvc_meta_row_channel').text().trim();
      const tempo = $(el).find('.mc_bc_rc.items').text().trim();
      const visualizacoes = $(el).find('.meta_vc_content').text().trim();
      const publicado = $(el).find('.meta_pd_content').text().trim();

      if (link && titulo) {
        resultados.push({
          titulo,
          canal,
          visualizacoes,
          tempo,
          publicado,
          link,
          thumb,
        });
      }
    });

    res.json({ resultados });
  } catch (err) {
    console.error('Erro Bing Videos:', err.message);
    res.status(500).json({ error: 'Erro ao buscar vídeos no Bing.' });
  }
});

module.exports = router;