const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {
    const baseUrl = "https://neextltda-canvas-api.hf.space/welcome3";

    // Repassa todos os parâmetros que chegarem na requisição
    const params = new URLSearchParams(req.query).toString();

    // Faz request para o Hugging Face
    const response = await axios.get(`${baseUrl}?${params}`, {
      responseType: "arraybuffer",
    });

    // Retorna a imagem como PNG
    res.setHeader("Content-Type", "image/png");
    res.send(response.data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar o welcome3" });
  }
});

module.exports = router;