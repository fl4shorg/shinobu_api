const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

const useragent_1 = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
};

// Função para decodificar entidades HTML (&amp;, &#x27;, etc.)
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
    const response = await axios.get("https://exame.com/", {
      headers: { ...useragent_1 },
    });

    const $ = cheerio.load(response.data, { scriptingEnabled: false });
    const noticias = [];

    // Estrutura 2025: cada notícia principal está dentro de um elemento com [data-cy="card-container"]
    $('[data-cy="card-container"]').each((i, e) => {
      const link = $(e).find("a").attr("href");
      const titulo = unescapeHtml($(e).find("h3").text().trim());
      let imagem = $(e).find("noscript img").attr("src") || "";

      if (!link || !titulo) return;

      // Corrigir link relativo
      const urlCompleta = link.startsWith("http")
        ? link
        : `https://exame.com${link}`;

      // Remover parâmetros e formato .webp
      if (imagem.includes("?")) imagem = imagem.split("?")[0];
      if (imagem.includes(".webp")) imagem = imagem.replace(/\.webp.*$/, "");

      noticias.push({
        noticia: titulo,
        imagem,
        link: urlCompleta,
      });
    });

    res.json({
      status: true,
      fonte: "https://exame.com/",
      total: noticias.length,
      resultados: noticias,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Erro ao obter notícias da Exame",
      erro: err.message,
    });
  }
});

module.exports = router;