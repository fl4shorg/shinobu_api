const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
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
   🔽 DOWNLOAD DE MÚSICA SPOTIFY (via Spotmate)
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
    if (!spotifyUrl.includes('open.spotify.com')) throw new Error('URL inválida.');

    // Pega HTML inicial para cookies e token CSRF
    const respostaRynn = await axios.get('https://spotmate.online/', {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(respostaRynn.data);

    const api = axios.create({
      baseURL: 'https://spotmate.online',
      headers: {
        cookie: respostaRynn.headers['set-cookie'].join('; '),
        'content-type': 'application/json',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'x-csrf-token': $('meta[name="csrf-token"]').attr('content')
      }
    });

    // Chama API interna do Spotmate
    const [{ data: metadados }, { data: download }] = await Promise.all([
      api.post('/getTrackData', { spotify_url: spotifyUrl }),
      api.post('/convert', { urls: spotifyUrl })
    ]);

    // Resposta final
    return res.status(200).json({
      ...API_NOTE,
      status: 'success',
      message: 'Música encontrada e baixada com sucesso',
      result: {
        title: metadados.title,
        artists: metadados.artistNames,
        duration: metadados.duration,
        year: metadados.year,
        spotify_url: spotifyUrl,
        download_url: download.url,
        thumbnail: metadados.albumImage
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
   ▶ PLAYSPOTIFY (pesquisa + download via Spotmate)
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
    // Pesquisa primeiro resultado
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

    // Download usando Spotmate
    const respostaRynn = await axios.get('https://spotmate.online/', {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(respostaRynn.data);

    const api = axios.create({
      baseURL: 'https://spotmate.online',
      headers: {
        cookie: respostaRynn.headers['set-cookie'].join('; '),
        'content-type': 'application/json',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'x-csrf-token': $('meta[name="csrf-token"]').attr('content')
      }
    });

    const [{ data: metadados }, { data: download }] = await Promise.all([
      api.post('/getTrackData', { spotify_url: trackUrl }),
      api.post('/convert', { urls: trackUrl })
    ]);

    return res.status(200).json({
      ...API_NOTE,
      status: 'success',
      message: 'Música encontrada e baixada com sucesso',
      result: {
        search_name: query,
        title: metadados.title,
        artists: metadados.artistNames,
        duration: metadados.duration,
        year: metadados.year,
        spotify_url: trackUrl,
        download_url: download.url,
        thumbnail: metadados.albumImage
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