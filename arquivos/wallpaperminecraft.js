// wallpaperminecraft2.js
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

router.use(async (req, res) => {
  try {
    const url = "https://getwallpapers.com/collection/wallpapers-of-minecraft";

    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(data);
    const imagens = [];

    $("img.isWiden").each((_, el) => {
      let src = $(el).attr("src") || $(el).attr("data-srcset");
      if (src && src.includes("/wallpaper/full/")) {
        // Corrigir URL relativa
        if (!src.startsWith("http")) {
          src = "https://getwallpapers.com" + src;
        }
        imagens.push(src);
      }
    });

    if (!imagens.length) return res.status(404).send("Nenhuma imagem encontrada");

    // Escolher uma imagem aleatória
    const escolhida = imagens[Math.floor(Math.random() * imagens.length)];

    // Baixar imagem e enviar como stream
    const response = await axios.get(escolhida, {
      responseType: "stream",
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    res.setHeader("Content-Type", response.headers["content-type"]);
    response.data.pipe(res);

  } catch (err) {
    console.error("Erro ao buscar wallpaper Minecraft:", err.message);
    res.status(500).send("Erro ao buscar wallpaper Minecraft.");
  }
});

module.exports = router;