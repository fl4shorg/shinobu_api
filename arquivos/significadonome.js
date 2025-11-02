// significadonome.js
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();
const default_criador = "© neext ltda";
const defaultImage = "https://telegra.ph/file/2003e814c68cf402903cf.jpg";

const useragent_1 = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
};

// Limpa HTML simples
function cleanHtml(str) {
  if (!str) return "";
  return str.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

// Endpoint: /significadonome?nome=Joao
router.get("/", async (req, res) => {
  try {
    const nome = req.query.nome;
    if (!nome)
      return res.status(400).json({ status: false, error: "Você precisa passar a query ?nome=" });

    const url = `https://www.dicionariodenomesproprios.com.br/${encodeURIComponent(nome.toLowerCase())}/`;

    const { data } = await axios.get(url, { headers: useragent_1 });
    const $ = cheerio.load(data);

    // Pega o texto principal do significado
    const significado = cleanHtml($("#significado").html() || $("#significado").text() || "");

    // Pega a imagem correta (classe content-img)
    let imagem = $("img.content-img").attr("src") || defaultImage;

    if (!imagem.startsWith("http")) {
      if (imagem.startsWith("//")) imagem = "https:" + imagem;
      else if (imagem.startsWith("/")) imagem = "https://www.dicionariodenomesproprios.com.br" + imagem;
    }

    if (!significado) {
      return res.json({
        status: 404,
        fonte: "https://www.dicionariodenomesproprios.com.br/",
        criador: default_criador,
        nome,
        resultado: "Significado não encontrado",
        imagem
      });
    }

    res.json({
      status: 200,
      fonte: "https://www.dicionariodenomesproprios.com.br/",
      criador: default_criador,
      nome,
      resultado: significado,
      imagem
    });

  } catch (err) {
    res.status(500).json({ status: false, error: err.toString() });
  }
});

module.exports = router;