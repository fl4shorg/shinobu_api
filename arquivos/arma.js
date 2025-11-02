const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");

const router = express.Router();

function extractImageUrlFromString(src, base = "https://www.casadotiro.com.br") {
  if (!src) return null;
  src = src.replace(/&amp;/g, "&").trim();
  try {
    const parsed = new URL(src, base);
    const inner = parsed.searchParams.get("image");
    if (inner) {
      try { return decodeURIComponent(inner); } catch (e) { return inner; }
    }
    return parsed.href;
  } catch (e) {
    return src;
  }
}

function parsePrice(precoStr) {
  if (!precoStr) return { preco: null, preco_num: null };
  let str = precoStr.replace(/\s+/g, " ").trim();
  // remove texto não numérico exceto , . -
  const cleaned = str.replace(/[^\d.,-]/g, "");
  const hasComma = cleaned.indexOf(",") !== -1;
  const hasDot = cleaned.indexOf(".") !== -1;
  let precoNum = null;
  try {
    if (hasComma && hasDot) {
      const lastComma = cleaned.lastIndexOf(",");
      const lastDot = cleaned.lastIndexOf(".");
      if (lastDot > lastComma) precoNum = parseFloat(cleaned.replace(/,/g, ""));
      else precoNum = parseFloat(cleaned.replace(/\./g, "").replace(/,/g, "."));
    } else if (hasComma && !hasDot) {
      precoNum = parseFloat(cleaned.replace(/\./g, "").replace(/,/g, "."));
    } else if (!hasComma && hasDot) {
      precoNum = parseFloat(cleaned.replace(/,/g, ""));
    } else {
      precoNum = parseFloat(cleaned);
    }
    if (Number.isNaN(precoNum)) precoNum = null;
  } catch (e) {
    precoNum = null;
  }
  return { preco: str, preco_num: precoNum };
}

// Rota: /arma?q=rifle
router.get("/", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Parâmetro ?q= obrigatório" });

  const url = `https://www.casadotiro.com.br/busca/${encodeURIComponent(q)}/`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const resultados = [];

    // percorre cada bloco .item-produto (padrão no HTML que você enviou)
    $("div.item-produto").each((_, el) => {
      const $block = $(el);
      const $link = $block.find("a").first();
      let href = $link.attr("href") || null;
      let link = null;
      if (href) link = href.startsWith("http") ? href : "https://www.casadotiro.com.br/" + href.replace(/^\/*/, "");

      // imagem dentro de .wrap-img img
      const $img = $block.find(".wrap-img img").first();
      let src = $img.attr("src") || $img.attr("data-src") || $img.attr("data-original") || "";
      const imagem = extractImageUrlFromString(src, "https://www.casadotiro.com.br");

      // titulo dentro de .wrap-descricao h3
      const titulo = $block.find(".wrap-descricao h3").first().text().trim() || null;

      // preço dentro de span.valor
      let precoStr = $block.find(".wrap-descricao span.valor").first().text() || "";
      if (!precoStr) precoStr = $block.find("span.valor").first().text() || "";
      const { preco, preco_num } = parsePrice(precoStr);

      if (titulo) {
        resultados.push({
          titulo,
          preco: preco || "Indisponível",
          preco_num,
          imagem: imagem || null,
          link,
        });
      }
    });

    if (!resultados || resultados.length === 0) {
      return res.status(404).json({ error: "Nenhum produto encontrado." });
    }

    return res.json({ status: 200, resultados: resultados.slice(0, 30) });
  } catch (err) {
    return res.status(500).json({
      error: "Erro ao buscar produtos em casadotiro",
      details: err.response?.status ? `${err.response.status} ${err.response.statusText}` : err.message,
    });
  }
});

module.exports = router;