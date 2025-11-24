// canvas/bolsonaro.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

/*
  Rota /bolsonaro — retorna a imagem gerada pela API
  Exemplo de uso:
  /bolsonaro?image=https://i.ibb.co/example.jpg
*/

router.get("/", async (req, res) => {
  const image = req.query.image;

  if (!image) {
    return res.status(400).json({
      status: "error",
      message: 'Parâmetro "image" é obrigatório (ex: ?image=URL)'
    });
  }

  try {
    // Envia todos os query params diretamente para a API
    const response = await axios.get(
      "https://neextltda-canvas-api.hf.space/bolsonaro",
      {
        params: req.query,
        responseType: "stream",
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 20000
      }
    );

    res.setHeader("Content-Type", "image/png");

    response.data.pipe(res);

    response.data.on("error", (err) => {
      console.error("Stream error:", err.message);
      if (!res.headersSent) {
        res.status(500).json({ status: "error", message: "Erro ao enviar imagem" });
      } else {
        res.end();
      }
    });
  } catch (err) {
    console.error("Erro ao gerar bolsonaro:", err.message);
    return res.status(500).json({
      status: "error",
      message: "Falha ao gerar imagem Bolsonaro"
    });
  }
});

module.exports = router;