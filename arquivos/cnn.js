const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { data } = await axios.get("https://www.cnnbrasil.com.br/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);
    const noticias = [];

    // Cada bloco de notícia principal
    $("section a").each((i, el) => {
      const linkRaw = $(el).attr("href") || "";
      const titulo = $(el).find("h3").text().trim();
      let imagem =
        $(el).find("img").attr("src") || $(el).find("img").attr("data-src") || "";
      const autor = $(el).find("a[href*='/blogs/'] h3").first().text().trim();

      // Remove .webp do final da imagem
      if (imagem.endsWith(".webp")) {
        imagem = imagem.replace(/\.webp.*$/, "");
      }

      if (titulo && linkRaw) {
        const link = linkRaw.startsWith("http")
          ? linkRaw
          : `https://www.cnnbrasil.com.br${linkRaw}`;

        noticias.push({
          noticia: titulo,
          imagem,
          autor: autor || null,
          link,
        });
      }
    });

    res.json({
      status: true,
      fonte: "https://www.cnnbrasil.com.br/",
      total: noticias.length,
      resultados: noticias,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Erro ao obter notícias da CNN Brasil",
      erro: err.message,
    });
  }
});

module.exports = router;