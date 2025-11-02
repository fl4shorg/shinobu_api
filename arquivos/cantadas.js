const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

// URLs das categorias de cantadas
const categorias = [
  "https://crushcantadas.com/cantadas-de-pedreiro/",
  "https://crushcantadas.com/cantadas-romanticas/",
  "https://crushcantadas.com/cantadas-safadas/",
  "https://crushcantadas.com/cantadas-pesadas/",
  "https://crushcantadas.com/cantadas-criativas/"
];

router.get("/", async (req, res) => {
  try {
    // Escolhe uma categoria aleatória
    const url = categorias[Math.floor(Math.random() * categorias.length)];
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Captura todas as cantadas dentro de <p>
    const cantadas = [];
    $("section.list section p").each((_, el) => {
      const texto = $(el).text().trim();
      if (texto) cantadas.push(texto);
    });

    if (cantadas.length === 0) {
      return res.status(404).json({ error: "Nenhuma cantada encontrada" });
    }

    // Retorna uma cantada aleatória
    const resultado = cantadas[Math.floor(Math.random() * cantadas.length)];

    res.json({
      status: 200,
      resultado // somente a cantada, sem categoria
    });
  } catch (err) {
    res.status(500).json({
      error: "Erro ao buscar cantadas",
      details: err.message
    });
  }
});

module.exports = router;