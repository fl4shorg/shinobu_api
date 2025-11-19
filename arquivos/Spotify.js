const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_NOTE = {
  api: 'API desenvolvida pela Neext',
  instagram: '@neet.tk'
};

// Função auxiliar para requisições externas
const callExternal = async (url, opts = {}) => {
  try {
    const response = await axios({
      url,
      method: opts.method || 'get',
      params: opts.params || {},
      timeout: opts.timeout || 15000
    });
    return response.data;
  } catch (err) {
    const msg = err.response?.data || err.message || 'Erro na requisição externa';
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
};

/* =====================================================
   🔽 DOWNLOAD DE MÚSICA
   ROTA:
   GET /download/spotify/download?url=LINK
   ===================================================== */
router.get('/download', async (req, res) => {
  const spotifyUrl = req.query.url;

  if (!spotifyUrl) {
    return res.status(400).json({
      ...API_NOTE,
      status: 'error',
      message: 'Parâmetro "url" é obrigatório'
    });
  }

  try {
    const data = await callExternal(
      'https://nayan-video-downloader.vercel.app/spotifyDl',
      { params: { url: spotifyUrl } }
    );

    if (!data || data.status !== 200) {
      return res.status(502).json({
        ...API_NOTE,
        status: 'error',
        message: 'Falha ao obter dados externos',
        external: data || null
      });
    }

    return res.status(200).json({
      ...API_NOTE,
      status: 'success',
      message: 'Dados obtidos com sucesso',
      data: data.data
    });

  } catch (error) {
    return res.status(500).json({
      ...API_NOTE,
      status: 'error',
      message: error.message
    });
  }
});

/* =====================================================
   🔍 PESQUISA SPOTIFY
   ROTA:
   GET /download/spotify/search?q=TERMO&limit=10
   ===================================================== */
router.get('/search', async (req, res) => {
  const query = req.query.q || req.query.name;
  const limit = Number(req.query.limit || 10);

  if (!query) {
    return res.status(400).json({
      ...API_NOTE,
      status: 'error',
      message: 'Parâmetro "q" é obrigatório (ex: ?q=lil peep)'
    });
  }

  try {
    const data = await callExternal(
      'https://nayan-video-downloader.vercel.app/spotify-search',
      { params: { name: query, limit } }
    );

    if (!data || data.status !== 200) {
      return res.status(502).json({
        ...API_NOTE,
        status: 'error',
        message: 'Falha ao obter dados externos',
        external: data || null
      });
    }

    return res.status(200).json({
      ...API_NOTE,
      status: 'success',
      message: 'Pesquisa realizada com sucesso',
      results: data.results
    });

  } catch (error) {
    return res.status(500).json({
      ...API_NOTE,
      status: 'error',
      message: error.message
    });
  }
});

/* =====================================================
   ▶ PLAYSPOTIFY (pesquisa + download)
   ROTA:
   GET /download/spotify/playspotify?q=NOME
   ===================================================== */
router.get('/playspotify', async (req, res) => {
  const query = req.query.q || req.query.name;

  if (!query) {
    return res.status(400).json({
      ...API_NOTE,
      status: 'error',
      message: 'Parâmetro "q" é obrigatório'
    });
  }

  try {
    // 1️⃣ Pesquisa
    const searchData = await callExternal(
      'https://nayan-video-downloader.vercel.app/spotify-search',
      { params: { name: query, limit: 1 } }
    );

    if (!searchData || searchData.status !== 200 || !searchData.results?.length) {
      return res.status(404).json({
        ...API_NOTE,
        status: 'error',
        message: 'Nenhum resultado encontrado'
      });
    }

    const first = searchData.results[0];
    const trackUrl = first.link;

    // 2️⃣ Download automático
    const downloadData = await callExternal(
      'https://nayan-video-downloader.vercel.app/spotifyDl',
      { params: { url: trackUrl } }
    );

    if (!downloadData || downloadData.status !== 200) {
      return res.status(500).json({
        ...API_NOTE,
        status: 'error',
        message: 'Erro ao baixar o resultado encontrado',
        external: downloadData || null
      });
    }

    // 3️⃣ Resposta final
    return res.status(200).json({
      ...API_NOTE,
      status: 'success',
      message: 'Música encontrada e baixada com sucesso',
      result: {
        search_name: query,
        title: downloadData.data.title,
        artists: downloadData.data.artistNames,
        duration: downloadData.data.duration,
        year: downloadData.data.year,
        spotify_url: trackUrl,
        download_url: downloadData.data.download_url,
        thumbnail: downloadData.data.albumImage
      }
    });

  } catch (error) {
    return res.status(500).json({
      ...API_NOTE,
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;