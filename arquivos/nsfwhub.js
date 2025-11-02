const express = require("express");
const axios = require("axios");

const router = express.Router();

// Lista de categorias
const categories = [
  "ass", "sixtynine", "pussy", "dick", "anal",
  "boobs", "bdsm", "black", "easter", "bottomless",
  "blowjub", "collared", "cum", "cumsluts", "dp",
  "dom", "extreme", "feet", "finger", "fuck",
  "futa", "gay", "gif", "group", "hentai",
  "kiss", "lesbian", "lick", "pegged", "phgif",
  "puffies", "real", "suck", "tattoo", "tiny",
  "toys", "xmas"
];

// Função que busca a URL da imagem na API
async function getImageUrl(type) {
  try {
    const { data } = await axios.get(`https://nsfwhub.onrender.com/nsfw?type=${type}`, {
      headers: { "User-Agent": "Mozilla/5.0" }, // evita bloqueio
      timeout: 5000, // timeout de 5s
    });

    return data.image?.url || null; // retorna sempre o link novo
  } catch (err) {
    console.error(`Erro ao buscar ${type}:`, err.message);
    return null;
  }
}

// Cria rota para cada categoria
categories.forEach((cat) => {
  router.get(`/${cat}`, async (req, res) => {
    const imgUrl = await getImageUrl(cat);

    if (!imgUrl) {
      return res.status(500).json({ status: false, error: "Erro ao buscar imagem da API" });
    }

    // Retorna JSON com link direto
    res.json({ status: true, url: imgUrl });
  });
});

module.exports = router;