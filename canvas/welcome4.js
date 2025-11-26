const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {
    const baseUrl = "https://neextltda-canvas-api.hf.space/welcome4";

    // Repassa todos os parâmetros recebidos para a API do Hugging Face
    const params = new URLSearchParams(req.query).toString();

    // Faz requisição para HF
    const response = await axios.get(`${baseUrl}?${params}`, {
      responseType: "arraybuffer",
    });

    // Retornar como imagem PNG
    res.setHeader("Content-Type", "image/png");
    res.send(response.data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar o welcome4" });
  }
});

module.exports = router;