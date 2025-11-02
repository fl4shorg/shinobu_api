//――――――――――――――――――――――――――――――――――――――――――
// 📺 dorama.js - Busca de Doramas do Doramore
//――――――――――――――――――――――――――――――――――――――――――

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

router.get("/dorama", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: "Faltando parâmetro ?q=" });
    }

    const url = `https://doramore.com/busca?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const resultados = [];

    $(".dorama-card").each((_, el) => {
      const link = $(el).find("a").attr("href");
      const titulo = $(el).find("h3").text().trim();
      const info = $(el).find("p").text().trim();
      const imagem = $(el).find("img").attr("data-src");

      resultados.push({
        titulo,
        info,
        imagem,
        link,
      });
    });

    res.json({
      status: 200,
      total: resultados.length,
      resultados,
    });
  } catch (erro) {
    console.error("Erro ao buscar doramas:", erro.message);
    res.status(500).json({ error: "Erro ao buscar doramas." });
  }
});

module.exports = router;