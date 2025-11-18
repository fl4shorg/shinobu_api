// arquivos/animefinder.js
const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const multer = require("multer");
const router = express.Router();

// Multer em memória
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Função para identificar anime
async function identifyAnime(buffer, filename) {
  try {
    const form = new FormData();
    form.append("image", buffer, { filename }); // envia buffer direto

    const res = await axios.post("https://www.animefinder.xyz/api/identify", form, {
      headers: { ...form.getHeaders() },
    });

    const d = res.data;

    return {
      status: true,
      anime: {
        title: d.animeTitle || null,
        synopsis: d.synopsis || null,
        genres: d.genres || [],
        studio: d.productionHouse || null,
        premiered: d.premiereDate || null,
      },
      character: {
        name: d.character || null,
        description: d.description || null,
      },
      references: Array.isArray(d.references)
        ? d.references.map((r) => ({ site: r.site, url: r.url }))
        : [],
    };
  } catch (err) {
    console.error("Erro AnimeFinder:", err.message);
    return { status: false, message: err.message };
  }
}

// Rota POST /animefinder
router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ status: false, message: "Arquivo não enviado" });

  try {
    const resultado = await identifyAnime(req.file.buffer, req.file.originalname);
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ status: false, message: "Erro interno no servidor" });
  }
});

module.exports = router;