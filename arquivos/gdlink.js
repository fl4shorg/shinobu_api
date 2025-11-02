// arquivos/gdlink.js
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

// Função que faz o scraping do Google Drive
async function driveScrape(url) {
  if (!/drive\.google\.com\/file\/d\//gi.test(url)) {
    throw new Error("URL inválida do Google Drive");
  }

  const id = url.split("/")[5]; // pega o ID do arquivo

  // Requisição GET para pegar o título da página
  const res = await axios.get(url, {
    timeout: 30000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  const $ = cheerio.load(res.data);
  const name = $("head").find("title").text().split("-")[0].trim();

  return {
    name,
    link: url,
    download: `https://drive.google.com/uc?export=download&id=${id}`,
  };
}

// Rota GET: /gdlink?url=...
router.get("/download/gdlink", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ status: false, erro: "Parâmetro ?url= é obrigatório" });
  }

  try {
    const data = await driveScrape(url);
    res.json({
      status: true,
      ...data, // retorna só name, link e download
    });
  } catch (error) {
    console.error("Erro em /gdlink:", error.message);
    res.status(500).json({ status: false, erro: error.message });
  }
});

module.exports = router;