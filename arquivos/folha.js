const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();
const default_criador = "© neext ltda";
const useragent_1 = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
};
const defaultImage = "https://telegra.ph/file/2003e814c68cf402903cf.jpg";

function unescapeHtml(str) {
  if (!str) return "";
  return str.replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"');
}

router.get("/", async (req, res) => {
  try {
    const { data } = await axios.get("https://www.folha.uol.com.br/", {
      headers: useragent_1
    });

    const $ = cheerio.load(data);
    const noticias = [];

    // Seleciona o <script> que contém o JSON das notícias
    const scriptContent = $('script[data-rotate-estudio-folha-json]').html();
    if (!scriptContent) {
      return res.json({
        status: 200,
        fonte: "https://www.folha.uol.com.br/",
        criador: default_criador,
        resultado: []
      });
    }

    const items = JSON.parse(scriptContent);

    items.forEach(n => {
      noticias.push({
        noticia: unescapeHtml(n.title || "Sem título"),
        desc: unescapeHtml(n.standfirst || "Sem descrição"),
        link: n.headline_url ? (n.headline_url.startsWith("http") ? n.headline_url : `https://www.folha.uol.com.br${n.headline_url}`) : "#",
        imagem: n.image_source || defaultImage
      });
    });

    res.json({
      status: 200,
      fonte: "https://www.folha.uol.com.br/",
      criador: default_criador,
      resultado: noticias
    });

  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;