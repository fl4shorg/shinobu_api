const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

// Função que pega os links da pesquisa
async function getVideoLinks(search, page = 1) {
  const url = `https://www.xnxx.com/search/${encodeURIComponent(search)}/${page}`;
  const { data } = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.144 Safari/537.36",
    },
  });

  const $ = cheerio.load(data);
  const links = [];

  $("div.mozaique div.thumb a").each((i, el) => {
    const href = $(el).attr("href");
    const title = $(el).attr("title");
    if (href && href.startsWith("/video-")) {
      links.push({
        title,
        url: "https://www.xnxx.com" + href
      });
    }
  });

  return links;
}

// Função que pega os downloads de um vídeo
async function getVideoData(url) {
  const { data } = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.144 Safari/537.36",
    },
  });

  const $ = cheerio.load(data);
  const title = $("meta[property='og:title']").attr("content") || "Sem título";
  const thumbnail = $("meta[property='og:image']").attr("content") || null;

  const scriptContent = $("script")
    .map((i, el) => $(el).html())
    .get()
    .find((txt) => txt && txt.includes("html5player.setVideoUrlHigh"));

  let videoHigh = null;
  let videoLow = null;

  if (scriptContent) {
    const matchHigh = scriptContent.match(/html5player\.setVideoUrlHigh\('(.*?)'\)/);
    const matchLow = scriptContent.match(/html5player\.setVideoUrlLow\('(.*?)'\)/);

    if (matchHigh) videoHigh = matchHigh[1];
    if (matchLow) videoLow = matchLow[1];
  }

  return {
    title,
    thumbnail,
    video: {
      high: videoHigh,
      low: videoLow,
    },
    url,
  };
}

// Rota única: pesquisa + download
router.use("/", async (req, res) => {
  try {
    const { q, page } = req.query;
    if (!q) return res.status(400).json({ error: "Informe um termo de busca (q)." });

    const links = await getVideoLinks(q, page || 1);

    const results = [];
    for (let i = 0; i < Math.min(5, links.length); i++) {
      const videoData = await getVideoData(links[i].url);
      results.push(videoData);
    }

    res.json(results);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: "Erro ao buscar vídeos." });
  }
});

module.exports = router;