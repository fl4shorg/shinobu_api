// arquivos/SoundMP3.js
// • Scrape SoundMP3 Downloader • Adaptado por Flash Kuun
// • Desenvolvido pela Neext •

const express = require('express');
const router = express.Router();
const axios = require('axios');

const bitrates = ['128', '192', '320'];

async function soundMP3Downloader(trackUrl, bitrate = '320') {
  if (!trackUrl) throw new Error('Informe o link da música do SoundCloud.');
  if (!bitrates.includes(bitrate)) bitrate = '320';

  try {
    const form = `videoURL=${encodeURIComponent(trackUrl)}&bitrate=${bitrate}`;
    const { data } = await axios.post('https://soundmp3.cc/convert.php', form, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://soundmp3.cc/',
      },
    });

    const match = data.match(/href=["'](downloads\/[^"']+\.mp3)["']/i);
    if (!match) throw new Error('Nenhum link encontrado.');

    const fullUrl = 'https://soundmp3.cc/' + encodeURI(match[1]);

    return {
      status: true,
      desenvolvido_por: 'Neext',
      url: fullUrl,
      bitrate,
    };
  } catch (e) {
    console.error('Erro SoundMP3:', e.message);
    throw new Error(`Erro ao processar o link: ${e.message}`);
  }
}

// === Rota Express ===
router.get('/', async (req, res) => {
  const { url, bitrate } = req.query;

  if (!url)
    return res.status(400).json({
      error: 'Informe o link da música do SoundCloud.',
      desenvolvido_por: 'Neext',
    });

  try {
    const resultado = await soundMP3Downloader(url, bitrate);
    res.json(resultado);
  } catch (err) {
    res.status(500).json({
      error: 'Erro ao baixar a música.',
      detalhes: err.message,
      desenvolvido_por: 'Neext',
    });
  }
});

module.exports = router;