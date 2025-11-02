const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

// Função para remover acentos
function removeAcentos(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Rota: /dicionario?q=palavra
router.get("/", async (req, res) => {
  const palavra = req.query.q;
  if (!palavra) return res.status(400).json({ error: "Parâmetro ?q= obrigatório" });

  const palavraNormalizada = removeAcentos(palavra.toLowerCase());
  const url = `https://www.dicio.com.br/${palavraNormalizada}/`;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Palavra
    const titulo = $("h1").first().text().trim();

    // Classe gramatical
    const classe = $(".txt .sig").first().text().trim() || undefined;

    // Definição
    const definicao = $(".significado").first().text().replace(/\n+/g, " ").trim();

    // Imagem
    let imagemEl = $("img.imagem-palavra").first();
    let imagem = null;
    if (imagemEl.length) {
      imagem = imagemEl.attr("src");
      if (imagem && !imagem.startsWith("http")) {
        imagem = "https://www.dicio.com.br" + imagem;
      }
    }

    // Conjugação
    let conjugacao = {};
    const conjTitle = $(".tit-other").filter((i, el) => $(el).text().toLowerCase().includes("conjugação")).first();
    if (conjTitle.length) {
      const conjP = conjTitle.next("p");
      if (conjP.length) {
        conjP.find("br").replaceWith("\n");
        conjP.find("a").each((i, el) => {
          $(el).replaceWith($(el).text());
        });
        const text = conjP.text().split("\n").map(l => l.trim()).filter(Boolean);
        text.forEach(line => {
          const [key, val] = line.split(":").map(s => s.trim());
          if (key && val) conjugacao[key.toLowerCase()] = val;
        });
      }
    }

    if (!titulo || !definicao) {
      return res.status(404).json({ error: "Significado não encontrado" });
    }

    res.json({
      palavra: titulo,
      ...(classe ? { classe_gramatical: classe } : {}),
      definicao,
      ...(imagem ? { imagem } : {}),
      ...(Object.keys(conjugacao).length ? { conjugacao } : {})
    });

  } catch (err) {
    res.status(500).json({
      error: "Erro ao buscar definição",
      details: err.message
    });
  }
});

module.exports = router;