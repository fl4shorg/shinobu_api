// arquivos/Instagram2.js
// • Scrape InstaTikTok • Adaptado por Flash Kuun
// • Desenvolvido pela Neext •

const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

const SITE_URL = 'https://instatiktok.com/';

async function instaTiktokDownloader(platform, inputUrl) {
  if (!inputUrl) throw new Error('Informe um link válido!');
  if (!['instagram', 'tiktok', 'facebook'].includes(platform))
    throw new Error('Plataforma inválida. Use instagram, tiktok ou facebook.');

  const form = new URLSearchParams();
  form.append('url', inputUrl);
  form.append('platform', platform);
  form.append('siteurl', SITE_URL);

  try {
    const res = await axios.post(`${SITE_URL}api`, form.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': SITE_URL,
        'Referer': SITE_URL,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    const html = res?.data?.html;
    if (!html || res?.data?.status !== 'success')
      throw new Error('Falha ao obter os dados.');

    const $ = cheerio.load(html);
    const links = [];

    $('a.btn[href^="http"]').each((_, el) => {
      const link = $(el).attr('href');
      if (link && !links.includes(link)) links.push(link);
    });

    if (links.length === 0) throw new Error('Nenhum link encontrado.');

    let download;
    if (platform === 'instagram') {
      download = links;
    } else if (platform === 'tiktok') {
      download = links.find((link) => /hdplay/.test(link)) || links[0];
    } else if (platform === 'facebook') {
      download = links.at(-1);
    }

    return { status: true, platform, download };
  } catch (e) {
    throw new Error(`Erro ao obter dados: ${e.message || e}`);
  }
}

// === Rota Express ===
router.get('/', async (req, res) => {
  const { url, plataforma } = req.query;

  if (!url) return res.status(400).json({ error: 'Informe a URL do vídeo.' });
  if (!plataforma)
    return res.status(400).json({ error: 'Informe a plataforma (instagram, tiktok ou facebook).' });

  try {
    const resultado = await instaTiktokDownloader(plataforma.toLowerCase(), url);

    res.json({
      desenvolvido_por: 'Neext',
      ...resultado
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Erro ao processar o vídeo',
      details: err.message,
      desenvolvido_por: 'Neext'
    });
  }
});

module.exports = router;