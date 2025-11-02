const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");
const router = express.Router();

// Função para buscar as notícias
const noticia = async () => {
  const feedUrl = "https://www.metropoles.com/rss"; 
  const { data } = await axios.get(feedUrl);
  const parser = new xml2js.Parser();

  const result = await parser.parseStringPromise(data);
  const items = result.rss.channel[0].item;

  const noticias = items.map(item => ({
    titulo: item.title[0],
    link: item.link[0],
    imagem: item.enclosure ? item.enclosure[0].$.url : null
  }));

  return noticias.slice(0, 10); // retorna apenas as 10 primeiras
};

// Rota relativa
router.get("/", async (req, res) => {
  try {
    const noticias = await noticia();
    res.json(noticias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;