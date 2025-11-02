const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const router = express.Router();

// Rota para notícias do Notícias ao Minuto
router.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://www.noticiasaominuto.com.br/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    const dados = [];

    $('div.menu-thumb.cursor-pointer').each((i, e) => {
      const noticia = $(e).find("p").text().trim();
      const imagem = $(e).find("img").attr("src");
      const postado = $(e).find(".menu-thumb-date").text().trim();
      const categoria = $(e).find(".nm-custom-label-category").text().trim();
      const link = $(e).find("a:first").attr("href");

      if (noticia && link) {
        dados.push({
          noticia,
          imagem: imagem.startsWith("http") ? imagem : `https://www.noticiasaominuto.com.br${imagem}`,
          postado,
          categoria,
          link: link.startsWith("http") ? link : `https://www.noticiasaominuto.com.br${link}`,
        });
      }
    });

    res.json({
      status: true,
      fonte: "https://www.noticiasaominuto.com.br/",
      total: dados.length,
      resultado: dados,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Erro ao obter notícias do Notícias ao Minuto",
      erro: err.message,
    });
  }
});

module.exports = router;