const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_NOTE = {
  api: 'API desenvolvida pela Neext',
  instagram: '@neet.tk'
};

// Função para download via FabDL
async function scrapeSpotify(url) {
  try {
    const initialResponse = await axios.get(
      `https://api.fabdl.com/spotify/get?url=${encodeURIComponent(url)}`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          "sec-ch-ua": "\"Not)A;Brand\";v=\"24\", \"Chromium\";v=\"116\"",
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": "\"Android\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          Referer: "https://spotifydownload.org/",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
      },
    );

    const { result } = initialResponse.data;
    const trackId = result.type === "album" ? result.tracks[0].id : result.id;

    const convertResponse = await axios.get(
      `https://api.fabdl.com/spotify/mp3-convert-task/${result.gid}/${trackId}`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          "sec-ch-ua": "\"Not)A;Brand\";v=\"24\", \"Chromium\";v=\"116\"",
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": "\"Android\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          Referer: "https://spotifydownload.org/",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
      },
    );

    const tid = convertResponse.data.result.tid;
    const progressResponse = await axios.get(
      `https://api.fabdl.com/spotify/mp3-convert-progress/${tid}`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          "sec-ch-ua": "\"Not)A;Brand\";v=\"24\", \"Chromium\";v=\"116\"",
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": "\"Android\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          Referer: "https://spotifydownload.org/",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
      },
    );

    return {
      title: result.name,
      type: result.type,
      artists: result.artists,
      duration: result.type === "album" ? result.tracks[0].duration_ms : result.duration_ms,
      image: result.image,
      download_url: `https://api.fabdl.com${progressResponse.data.result.download_url}`,
      status: progressResponse.data.result.status,
    };
  } catch (error) {
    console.error("Spotify download error:", error);
    throw new Error("Failed to download from Spotify");
  }
}

/* =====================================================
   🔽 DOWNLOAD DE MÚSICA SPOTIFY (FabDL)
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
    const data = await scrapeSpotify(spotifyUrl);

    return res.status(200).json({
      ...API_NOTE,
      status: 'success',
      message: 'Música obtida com sucesso',
      result: data
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
   ▶ PLAYSPOTIFY (pesquisa + download FabDL)
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

    // Download via FabDL
    const data = await scrapeSpotify(trackUrl);

    return res.status(200).json({
      ...API_NOTE,
      status: 'success',
      message: 'Música encontrada e baixada com sucesso',
      result: {
        search_name: query,
        ...data,
        spotify_url: trackUrl
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