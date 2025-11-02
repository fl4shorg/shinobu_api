const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

const useragent_1 = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
};

router.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://www.terra.com.br/noticias/", {
      headers: { ...useragent_1 }
    });

    const $ = cheerio.load(response.data);
    const noticias = [];

    $('div.card.card-news.card-h-small.card-has-image').each((i, e) => {
      let imagem = $(e).find('img').attr('src') || "";
      const titulo = $(e).find('a.card-news__text--title').text().trim();
      const link = $(e).find('a.card-news__text--title').attr('href');

      // Remove .webp do final da imagem
      if (imagem.includes(".webp")) imagem = imagem.replace(/\.webp.*$/, "");

      if (titulo && link) {
        noticias.push({
          noticia: titulo,
          imagem,
          link: link.startsWith("http") ? link : `https://www.terra.com.br${link}`
        });
      }
    });

    res.json({
      status: true,
      fonte: "https://www.terra.com.br/noticias/",
      total: noticias.length,
      resultados: noticias
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Erro ao obter notícias do Terra",
      erro: err.message
    });
  }
});

module.exports = router;