// arquivos/frasesanime.js
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

// Função para pegar frases de uma página
const getPhrasesFromPage = async (page = 1) => {
  const url =
    page === 1
      ? "https://www.pensador.com/frases_animes/"
      : `https://www.pensador.com/frases_animes/${page}`;

  const { data } = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    },
    timeout: 15000,
  });

  const $ = cheerio.load(data);
  const phrases = [];

  $(".thought-card").each((i, el) => {
    const fraseEl = $(el).find("p.frase");
    const text = fraseEl.text().replace(/\s+/g, " ").trim();
    const author =
      $(el).find("span.author-name").text().trim() || "Desconhecido";

    if (text) {
      phrases.push({ text, author });
    }
  });

  return phrases;
};

// Rota principal: /frases/frasesanime
router.get("/", async (req, res) => {
  try {
    // Página aleatória entre 1 e 29
    const randomPage = Math.floor(Math.random() * 29) + 1;
    const phrases = await getPhrasesFromPage(randomPage);

    if (!phrases || phrases.length === 0) {
      return res.status(404).json({ message: "Nenhuma frase encontrada." });
    }

    // Frase aleatória da página
    const randomIndex = Math.floor(Math.random() * phrases.length);
    const randomPhrase = phrases[randomIndex];

    res.json(randomPhrase);
  } catch (err) {
    console.error("Erro na rota /frases/frasesanime:", err.message);
    res.status(500).json({ error: "Erro ao buscar frase." });
  }
});

module.exports = router;