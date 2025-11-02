const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

const useragent_1 = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
};

// Função para limpar entidades HTML (&amp;, &#x27; etc.)
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
    const response = await axios.get("https://www.agazeta.com.br/brasil", {
      headers: { ...useragent_1 },
    });

    const $ = cheerio.load(response.data);
    const dados = [];

    $("article.box--lista").each((i, e) => {
      const link = $(e).find("a").attr("href");
      const imagem = $(e).find("img").attr("src");
      const categoria = $(e).find("label.kicker").text().trim();
      const noticia = unescapeHtml($(e).find("h2.titulo").text().trim());
      const desc = unescapeHtml($(e).find("h3.linha-fina").text().trim());

      if (noticia && link) {
        dados.push({
          noticia,
          desc,
          categoria,
          imagem: imagem.startsWith("http") ? imagem : `https://www.agazeta.com.br${imagem}`,
          link: link.startsWith("http") ? link : `https://www.agazeta.com.br${link}`,
        });
      }
    });

    res.json({
      status: true,
      fonte: "https://www.agazeta.com.br/brasil",
      total: dados.length,
      resultado: dados,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Erro ao obter notícias de A Gazeta",
      erro: err.message,
    });
  }
});

module.exports = router;