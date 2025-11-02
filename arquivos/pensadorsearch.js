const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

// Função para pegar frases de uma página de busca
const getPhrasesFromSearchPage = async (query, page = 1) => {
  const url =
    page === 1
      ? `https://www.pensador.com/busca.php?q=${encodeURIComponent(query)}`
      : `https://www.pensador.com/busca.php?q=${encodeURIComponent(query)}&p=${page}`;

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
    const text = $(el).find("p.frase").text().replace(/\s+/g, " ").trim();
    const author =
      $(el).find("span.author-name").text().trim() || "Desconhecido";

    if (text) phrases.push({ text, author });
  });

  return phrases;
};

// Função auxiliar para embaralhar array
const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

// Rota principal: /pensador?q=palavra-chave
router.get("/", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "O parâmetro 'q' é obrigatório" });

    let allPhrases = [];

    // Pegar frases de 3 páginas aleatórias (ajustável)
    for (let i = 0; i < 3; i++) {
      const randomPage = Math.floor(Math.random() * 10) + 1;
      const phrases = await getPhrasesFromSearchPage(query, randomPage);
      allPhrases = allPhrases.concat(phrases);
    }

    if (!allPhrases || allPhrases.length === 0) {
      return res.status(404).json({ message: "Nenhuma frase encontrada." });
    }

    // Embaralha e pega as 10 primeiras
    const random10 = shuffleArray(allPhrases).slice(0, 10);

    res.json(random10);
  } catch (err) {
    console.error("Erro na rota /pensador:", err.message);
    res.status(500).json({ error: "Erro ao buscar frases." });
  }
});

module.exports = router;