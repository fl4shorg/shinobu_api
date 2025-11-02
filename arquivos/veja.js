const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const router = express.Router();

// Função que retorna notícias da Veja
router.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://veja.abril.com.br/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    const dados = [];

    $('a.card.a').each((i, e) => {
      const link = $(e).attr("href");
      const imagem =
        $(e).find("img").attr("data-src") || $(e).find("img").attr("src") || "https://telegra.ph/file/2003e814c68cf402903cf.jpg";
      const noticia = $(e).find(".title").text().trim();
      const categoria = $(e).find(".category").first().text().trim();

      if (noticia && link) {
        dados.push({
          noticia,
          categoria,
          imagem: imagem.startsWith("http") ? imagem : `https://veja.abril.com.br${imagem}`,
          link: link.startsWith("http") ? link : `https://veja.abril.com.br${link}`,
        });
      }
    });

    res.json({
      status: true,
      fonte: "https://veja.abril.com.br/",
      total: dados.length,
      resultado: dados,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Erro ao obter notícias da Veja",
      erro: err.message,
    });
  }
});

module.exports = router;