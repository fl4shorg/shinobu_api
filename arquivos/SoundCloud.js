// arquivos/SoundMP3.js  
// • Scrape SoundMP3 Downloader + Pesquisa SoundCloud usando scdl-core • Neext  
// • Compatível com Vercel (serverless)  

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { SoundCloud } = require('scdl-core');

const bitrates = ['128', '192', '320'];

// Função de download via soundmp3.cc
async function soundMP3Downloader(trackUrl, bitrate = '320') {
  if (!trackUrl) throw new Error('Informe o link da música do SoundCloud.');
  if (!bitrates.includes(bitrate)) bitrate = '320';

  try {
    const form = `videoURL=${encodeURIComponent(trackUrl)}&bitrate=${bitrate}`;
    const { data } = await axios.post(
      'https://soundmp3.cc/convert.php',
      form,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://soundmp3.cc/',
        },
      }
    );

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

// === Rota de Download ===
router.get('/', async (req, res) => {
  const { url, bitrate } = req.query;

  if (!url) {
    return res.status(400).json({
      error: 'Informe o link da música do SoundCloud.',
      desenvolvido_por: 'Neext',
    });
  }

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

// === Rota de Pesquisa ===
router.get('/search', async (req, res) => {
  const { q, limit } = req.query;

  if (!q) {
    return res.status(400).json({
      error: 'Informe o parâmetro de pesquisa "q".',
      desenvolvido_por: 'Neext',
    });
  }

  try {
    // Conecta com client_id da variável de ambiente
    await SoundCloud.connect({ clientId: process.env.SOUNDCLOUD_CLIENT_ID });

    const result = await SoundCloud.search({
      query: q,
      limit: limit ? parseInt(limit) : 10,
      filter: 'tracks',
    });

    const tracks = result.collection || result;

    const resultados = tracks.map(track => ({
      title: track.title,
      author: track.user?.username || 'Desconhecido',
      url: track.permalink_url,
      duration: track.duration,
      artwork: track.artwork_url,
    }));

    res.json({
      status: true,
      desenvolvido_por: 'Neext',
      query: q,
      results: resultados,
    });
  } catch (err) {
    console.error('Erro SoundCloud Search (scdl-core):', err);
    res.status(500).json({
      error: 'Erro ao pesquisar músicas.',
      detalhes: err.message,
      desenvolvido_por: 'Neext',
    });
  }
});

// === Rota PlaySoundCloud (1 resultado + download) ===
router.get('/playsoundcloud', async (req, res) => {
  const { q, bitrate } = req.query;

  if (!q) {
    return res.status(400).json({
      error: 'Informe o parâmetro "q" para pesquisa.',
      desenvolvido_por: 'Neext',
    });
  }

  try {
    // Conecta com client_id da variável de ambiente
    await SoundCloud.connect({ clientId: process.env.SOUNDCLOUD_CLIENT_ID });

    // Pesquisa 1 resultado
    const result = await SoundCloud.search({
      query: q,
      limit: 1,
      filter: 'tracks',
    });

    const tracks = result.collection || result;

    if (!tracks.length) {
      return res.status(404).json({
        error: 'Nenhuma música encontrada para a pesquisa.',
        desenvolvido_por: 'Neext',
      });
    }

    const firstTrack = tracks[0];

    // Download do primeiro resultado
    const download = await soundMP3Downloader(firstTrack.permalink_url, bitrate);

    // Retorna apenas 1 resultado + download
    res.json({
      status: true,
      desenvolvido_por: 'Neext',
      track: {
        title: firstTrack.title,
        author: firstTrack.user?.username || 'Desconhecido',
        url: firstTrack.permalink_url,
        duration: firstTrack.duration,
        artwork: firstTrack.artwork_url,
      },
      download,
    });

  } catch (err) {
    console.error('Erro PlaySoundCloud:', err);
    res.status(500).json({
      error: 'Erro ao pesquisar e baixar música.',
      detalhes: err.message,
      desenvolvido_por: 'Neext',
    });
  }
});

module.exports = router;