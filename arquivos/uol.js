const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://www.uol.com.br/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    const noticias = [];

    $("article.cardRow__list__item.col.headlineStandard").each((i, el) => {
      const link = $(el).find("a").attr("href") || "";
      const titulo =
        $(el).find(".headlineStandard__container__title").text().trim() ||
        $(el).find("a").attr("title") ||
        "";
      let imagem =
        $(el).find("picture source").attr("srcset") ||
        $(el).find("img").attr("src") ||
        "";

      // remove o .webp e tudo que vem depois (ex: .jpg.webp → .jpg)
      if (imagem.includes(".webp")) {
        imagem = imagem.replace(/\.webp.*$/, "");
      }

      if (titulo && link) {
        noticias.push({
          noticia: titulo,
          imagem,
          link,
        });
      }
    });

    res.json({
      status: true,
      fonte: "https://www.uol.com.br/",
      total: noticias.length,
      resultados: noticias,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Erro ao obter notícias do UOL",
      erro: err.message,
    });
  }
});

module.exports = router;