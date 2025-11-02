const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://www.poder360.com.br/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    const noticias = [];

    $(".box-news-list__news").each((i, el) => {
      const noticia = $(el).find("h2 > a").text().trim();
      const link = $(el).find("h2 > a").attr("href");
      const imagem =
        $(el).find("img").attr("srcset") || $(el).find("img").attr("src") || "";

      if (noticia && link) {
        noticias.push({
          noticia,
          imagem: imagem.startsWith("http") ? imagem : `https://www.poder360.com.br${imagem}`,
          link,
        });
      }
    });

    res.json({
      status: true,
      fonte: "https://www.poder360.com.br/",
      total: noticias.length,
      resultados: noticias,
    });
  } catch (err) {
    console.error("Erro ao acessar Poder360:", err.message);
    res.status(500).json({
      status: false,
      message: "Erro ao obter notícias do Poder360",
      erro: err.message,
    });
  }
});

module.exports = router;