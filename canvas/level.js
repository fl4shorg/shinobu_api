const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {
    const baseUrl = "https://neextltda-canvas-api.hf.space/level2";

    // Converte todos os parâmetros recebidos e repassa
    const params = new URLSearchParams(req.query).toString();

    // Faz request para o Hugging Face
    const response = await axios.get(`${baseUrl}?${params}`, {
      responseType: "arraybuffer",
    });

    // Retorna a imagem para o cliente
    res.setHeader("Content-Type", "image/png");
    res.send(response.data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar o level card" });
  }
});

module.exports = router;