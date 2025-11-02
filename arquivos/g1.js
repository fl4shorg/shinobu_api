const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://g1.globo.com/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    const noticias = [];

    $(".feed-post").each((i, el) => {
      const noticia = $(el).find("a.feed-post-link").text().trim();
      const link = $(el).find("a.feed-post-link").attr("href");
      const imagem = $(el).find("img").attr("src") || "";
      const desc = $(el).find(".feed-post-body-resumo").text().trim() || "";
      const categoria = $(el)
        .find(".feed-post-metadata-section")
        .text()
        .trim() || "";
      const postado = $(el).find("span.feed-post-datetime").text().trim() || "";

      if (noticia && link) {
        noticias.push({
          noticia,
          descricao: desc,
          categoria,
          imagem,
          link,
          postado,
        });
      }
    });

    res.json({
      status: true,
      fonte: "https://g1.globo.com/",
      total: noticias.length,
      resultados: noticias,
    });
  } catch (err) {
    console.error("Erro ao acessar G1:", err.message);
    res.status(500).json({
      status: false,
      message: "Erro ao obter notícias do G1",
      erro: err.message,
    });
  }
});

module.exports = router;