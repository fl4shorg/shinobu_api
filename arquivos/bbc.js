const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

const useragent_1 = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
};

function unescapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

router.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://www.bbc.com/portuguese", {
      headers: { ...useragent_1 },
    });

    const $ = cheerio.load(response.data);
    const dados = [];

    $("li.bbc-jw2yjd").each((i, e) => {
      const noticia = unescapeHtml($(e).find("h3 a").text().trim());
      const link = $(e).find("h3 a").attr("href");
      const desc = $(e).find("p.promo-paragraph").text().trim();
      const postado = $(e).find("time").text().trim();

      // extrair a melhor imagem (srcset -> pegar última)
      let imagem = $(e).find("source[type='image/jpeg']").attr("srcset") || "";
      if (imagem) {
        const partes = imagem.split(",");
        const ultima = partes[partes.length - 1]?.trim().split(" ")[0];
        imagem = ultima?.startsWith("http") ? ultima : "";
      } else {
        imagem = $(e).find("img").attr("src") || "";
      }

      if (noticia && link) {
        dados.push({
          noticia,
          desc,
          imagem,
          postado,
          link: link.startsWith("http") ? link : `https://www.bbc.com${link}`
        });
      }
    });

    res.json({
      status: true,
      fonte: "https://www.bbc.com/portuguese",
      total: dados.length,
      resultado: dados
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Erro ao obter notícias da BBC",
      erro: err.message
    });
  }
});

module.exports = router;