// canvas/mclovin.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

/*
  Rota /mclovin — repassa a imagem gerada pela API HuggingFace
  Exemplo:
  /mclovin?image=https://i.ibb.co/1tVsD0RL/604495ea82f405657e11518672a598c0-2.jpg
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
    // Repassa todos os query params para a API (flexível para futuros parâmetros)
    const response = await axios.get("https://neextltda-canvas-api.hf.space/mclovin", {
      params: req.query,
      responseType: "stream",
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      timeout: 20000
    });

    // Define o content-type como imagem (a API retorna PNG na maioria dos casos)
    res.setHeader("Content-Type", "image/png");

    // Pipe do stream direto para o cliente
    response.data.pipe(res);

    // Tratamento de erro no stream remoto
    response.data.on("error", (err) => {
      console.error("Stream error from HF API:", err.message);
      if (!res.headersSent) {
        res.status(500).json({ status: "error", message: "Erro no stream da imagem" });
      } else {
        res.end();
      }
    });
  } catch (err) {
    console.error("Erro ao gerar mclovin:", err.message);
    return res.status(500).json({
      status: "error",
      message: "Falha ao gerar a imagem mclovin"
    });
  }
});

module.exports = router;