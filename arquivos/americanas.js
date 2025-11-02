const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const router = express.Router();

// Rota: /americanas?q=iphone
router.get("/", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Faltou o parâmetro ?q=" });

  const url = `https://www.americanas.com.br/s?q=${encodeURIComponent(query)}`;

  try {
    // Requisição para Browserless
    const response = await fetch(
      `https://chrome.browserless.io/content?token=2TIy5uN0AGd804J090c274026639a0345ca11109daac90d5b`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      }
    );

    const html = await response.text();
    const $ = cheerio.load(html);

    const produtos = [];

    $("div.ProductCard__Wrapper").each((i, el) => {
      const titulo = $(el).find("h3.ProductCard_productName__mwx7Y").attr("title")?.trim();
      const imagem = $(el).find("img").attr("src") || $(el).find("img").attr("data-src");
      const preco = $(el).find("p.ProductCard_productPrice__XFEqu").text()?.trim();
      const avaliacao = $(el).find(".avg-rating").text()?.trim() || null;
      const linkEl = $(el).find("a");
      const link = linkEl.attr("href") ? "https://www.americanas.com.br" + linkEl.attr("href") : null;

      if (titulo && imagem && preco && link) {
        produtos.push({ titulo, preco, avaliacao, imagem, link });
      }
    });

    if (produtos.length === 0) return res.status(404).json({ error: "Nenhum produto encontrado." });

    res.json({ status: 200, resultados: produtos.slice(0, 10) });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar produtos na Americanas", details: err.message });
  }
});

module.exports = router;