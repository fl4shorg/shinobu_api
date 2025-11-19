const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

const API_NOTE = {
  api: 'API desenvolvida pela Neext',
  instagram: '@neet.tk'
};

/* =====================================================
   Função scrape Spotify via Spotimate
   ===================================================== */
async function scrapeSpotify(url, turnstileToken) {
  try {
    const resHome = await axios.get("https://spotimate.io/");
    const $ = cheerio.load(resHome.data);

    const tokenInput = $("input[type='hidden']").filter((i, el) => {
      const name = $(el).attr("name");
      return name && name.startsWith("_");
    });

    const tokenName = tokenInput.attr("name");
    const tokenValue = tokenInput.attr("value");

    const cookies = resHome.headers["set-cookie"];
    let sessionData = "";
    if (cookies) {
      const sessionCookie = cookies.find(c => c.startsWith("session_data="));
      if (sessionCookie) sessionData = sessionCookie.split(";")[0].split("=")[1];
    }

    const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substr(2, 16);
    const formData = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="url"`,
      "",
      url,
      `--${boundary}`,
      `Content-Disposition: form-data; name="${tokenName}"`,
      "",
      tokenValue,
      `--${boundary}`,
      `Content-Disposition: form-data; name="cf-turnstile-response"`,
      "",
      turnstileToken,
      `--${boundary}--`,
      ""
    ].join("\r\n");

    const resApi = await axios.post("https://spotimate.io/action", formData, {
      headers: {
        "content-type": `multipart/form-data; boundary=${boundary}`,
        "cookie": `session_data=${sessionData}`,
        "origin": "https://spotimate.io",
        "referer": "https://spotimate.io/",
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36"
      }
    });

    const $result = cheerio.load(resApi.data.html || resApi.data);

    const songTitle = $result("h3 div").text().trim();
    const artist = $result("p span").text().trim();
    const coverImage = $result("img").first().attr("src");

    const mp3Link = $result("a").filter((i, el) => {
      const href = $result(el).attr("href");
      const text = $result(el).text();
      return href && href.includes("/dl?token=") && text.includes("Download Mp3");
    }).first().attr("href");

    const coverLink = $result("a").filter((i, el) => {
      const href = $result(el).attr("href");
      const text = $result(el).text();
      return href && href.includes("/dl?token=") && text.includes("Download Cover");
    }).first().attr("href");

    return {
      title: songTitle,
      artist,
      coverImage,
      mp3DownloadLink: mp3Link || null,
      coverDownloadLink: coverLink || null,
      url
    };
  } catch (err) {
    console.error("Spotify scrape error:", err.message);
    throw new Error("Falha ao baixar música do Spotify");
  }
}

/* =====================================================
   🔍 Pesquisa Spotify via Nayan
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
    const response = await axios.get('https://nayan-video-downloader.vercel.app/spotify-search', {
      params: { name: query, limit }
    });

    if (!response.data || response.data.status !== 200) {
      return res.status(502).json({
        ...API_NOTE,
        status: 'error',
        message: 'Falha ao obter dados externos',
        external: response.data || null
      });
    }

    return res.status(200).json({
      ...API_NOTE,
      status: 'success',
      message: 'Pesquisa realizada com sucesso',
      results: response.data.results
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
   🔽 Download Spotify
   GET /download/spotify/download?url=LINK
   ===================================================== */
router.get('/download', async (req, res) => {
  const spotifyUrl = req.query.url;
  if (!spotifyUrl) return res.status(400).json({ ...API_NOTE, status: 'error', message: 'Parâmetro "url" é obrigatório' });

  try {
    // Aqui você precisa de um serviço de bypass para o Turnstile
    // Ex: solveBypass() -> token
    const turnstileToken = "FAKE_TOKEN"; // substitua pelo token real
    const data = await scrapeSpotify(spotifyUrl, turnstileToken);

    return res.status(200).json({
      ...API_NOTE,
      status: 'success',
      message: 'Música obtida com sucesso',
      result: data
    });

  } catch (error) {
    return res.status(500).json({ ...API_NOTE, status: 'error', message: error.message });
  }
});

/* =====================================================
   ▶ Play Spotify (pesquisa + download)
   GET /download/spotify/playspotify?q=NOME
   ===================================================== */
router.get('/playspotify', async (req, res) => {
  const query = req.query.q || req.query.name;
  if (!query) return res.status(400).json({ ...API_NOTE, status: 'error', message: 'Parâmetro "q" é obrigatório' });

  try {
    // Pesquisa primeiro via Nayan
    const searchResponse = await axios.get('https://nayan-video-downloader.vercel.app/spotify-search', { params: { name: query, limit: 1 } });
    if (!searchResponse.data?.results?.length) return res.status(404).json({ ...API_NOTE, status: 'error', message: 'Nenhum resultado encontrado' });

    const trackUrl = searchResponse.data.results[0].link;

    // Baixa via Spotimate
    const turnstileToken = "FAKE_TOKEN"; // substitua pelo token real
    const data = await scrapeSpotify(trackUrl, turnstileToken);

    return res.status(200).json({
      ...API_NOTE,
      status: 'success',
      message: 'Música encontrada e baixada com sucesso',
      result: data
    });

  } catch (error) {
    return res.status(500).json({ ...API_NOTE, status: 'error', message: error.message });
  }
});

module.exports = router;