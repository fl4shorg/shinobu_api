const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

const MEME_PAGES = [
  "https://pt.memedroid.com/memes/random",
  "https://pt.memedroid.com/memes/top/day",
  "https://pt.memedroid.com/memes/latest",
  "https://pt.memedroid.com/memes/trending",
];

function normalizeUrl(url) {
  if (!url) return null;
  url = url.trim();
  if (url.startsWith("//")) return "https:" + url;
  if (url.startsWith("/")) return "https://pt.memedroid.com" + url;
  return url;
}

// GET /memes
router.get("/", async (req, res) => {
  try {
    // escolhe uma página aleatória
    const pageUrl = MEME_PAGES[Math.floor(Math.random() * MEME_PAGES.length)];

    const resp = await axios.get(pageUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000,
    });

    const $ = cheerio.load(resp.data);
    const medias = [];

    // imagens
    $("img.img-responsive.grey-background").each((i, el) => {
      let src =
        $(el).attr("data-src") ||
        $(el).attr("data-original") ||
        $(el).attr("src") ||
        "";
      src = normalizeUrl(src);
      if (src && src.includes("memedroid.com")) {
        medias.push({ type: "image", url: src });
      }
    });

    // vídeos
    $("video.item-video").each((i, el) => {
      const source = $(el).find("source[type='video/mp4']").attr("src");
      if (source) {
        medias.push({ type: "video", url: normalizeUrl(source) });
      }
    });

    if (medias.length === 0) {
      res.status(404).send("Nenhuma mídia encontrada");
      return;
    }

    const meme = medias[Math.floor(Math.random() * medias.length)];

    if (meme.type === "image") {
      // stream da imagem
      const response = await axios.get(meme.url, { responseType: "stream" });
      res.setHeader(
        "Content-Type",
        response.headers["content-type"] || "image/jpeg"
      );
      response.data.pipe(res);
    } else if (meme.type === "video") {
      // retorna JSON com link do vídeo
      res.json({ type: "video", url: meme.url });
    }
  } catch (err) {
    console.error("Erro ao buscar meme:", err.message);
    res.status(500).send("Falha ao carregar meme");
  }
});

module.exports = router;