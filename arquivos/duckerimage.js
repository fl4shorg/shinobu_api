const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

router.get("/", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json({ error: "Faltando parâmetro: q" });

  try {
    const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iar=images&t=h_`;
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
    });

    const $ = cheerio.load(data);
    const imagens = [];

    $("img").each((i, el) => {
      let src = $(el).attr("src");
      const alt = $(el).attr("alt") || null;

      if (src && src.includes("external-content.duckduckgo.com/iu")) {
        if (src.startsWith("//")) src = "https:" + src;

        imagens.push({
          imagem: src,
          descricao: alt,
        });
      }
    });

    if (imagens.length === 0) {
      return res.json({ status: false, message: "Nenhuma imagem encontrada" });
    }

    res.json({
      status: true,
      total: imagens.length,
      resultados: imagens,
    });
  } catch (err) {
    console.error("Erro ao buscar imagens DuckDuckGo:", err.message);
    res.status(500).json({
      status: false,
      message: "Erro ao buscar imagens no DuckDuckGo",
    });
  }
});

module.exports = router;