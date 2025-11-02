const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

// Rota: /audiomeme?q=lula
router.get("/", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Parâmetro ?q= obrigatório" });

  try {
    const response = await axios.get(`https://www.myinstants.com/pt/search/?name=${encodeURIComponent(query)}`);
    const $ = cheerio.load(response.data);

    const resultados = [];

    $("button.small-button").each((_, el) => {
      const onclick = $(el).attr("onclick"); // ex: play('/media/sounds/lula-e-neymar-47.mp3', ...)
      const match = onclick.match(/play\('(.+?)'/);
      if (match) {
        const audioDirect = "https://www.myinstants.com" + match[1];
        resultados.push({
          titulo: $(el).attr("title"),
          audio_direct: audioDirect
        });
      }
    });

    if (resultados.length === 0) {
      return res.status(404).json({ error: "Nenhum áudio encontrado" });
    }

    res.json({
      pesquisa: query,
      total: resultados.length,
      resultados
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar áudios", details: err.message });
  }
});

module.exports = router;