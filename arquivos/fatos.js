const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const url = "https://pt.wikipedia.org/wiki/Wikip%C3%A9dia:Sabia_que/Mais_interessantes";
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Pega todos os textos de fatos dentro da tabela
    const fatos = [];
    $("table.wikitable td").each((i, el) => {
      let texto = $(el).text().trim();

      // Limpa completamente quebras e espaços
      texto = texto.replace(/\s+/g, " ").replace(/\\n|\\r|\\t/g, "").trim();

      if (texto && texto.length > 15) fatos.push(texto);
    });

    if (!fatos.length) return res.status(404).json({ error: "Nenhum fato encontrado" });

    // Escolhe um aleatório
    const fato = fatos[Math.floor(Math.random() * fatos.length)];

    res.json({ fato });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar fatos", details: err.message });
  }
});

module.exports = router;