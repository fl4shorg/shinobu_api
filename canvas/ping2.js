const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {
    const baseUrl = "https://neextltda-canvas-api.hf.space/ping2";

    // Repassa todos os parâmetros recebidos
    const params = new URLSearchParams(req.query).toString();

    // Request para o Hugging Face
    const response = await axios.get(`${baseUrl}?${params}`, {
      responseType: "arraybuffer",
    });

    // Retorna como imagem PNG
    res.setHeader("Content-Type", "image/png");
    res.send(response.data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar o ping2" });
  }
});

module.exports = router;