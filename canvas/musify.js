// ./canvas/musify.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const {
      thumbnail,
      name,
      author,
      requester,
      progress,
      startTime,
      endTime,
      backgroundColor,
      nameColor,
      progressColor
    } = req.query;

    // validação mínima (os básicos)
    if (!thumbnail || !name || !author || !requester) {
      return res.status(400).json({
        status: "error",
        message: "Parâmetros obrigatórios: thumbnail, name, author, requester"
      });
    }

    // monta a URL da API externa exatamente como os outros endpoints
    const apiURL =
      "https://neextltda-canvas-api.hf.space/musify?" +
      new URLSearchParams({
        thumbnail,
        name,
        author,
        requester,
        progress: progress || "0",
        startTime: startTime || "0:00",
        endTime: endTime || "0:00",
        backgroundColor: backgroundColor || "#1c1c1c",
        nameColor: nameColor || "#FFFFFF",
        progressColor: progressColor || "#00FF00"
      }).toString();

    const response = await axios.get(apiURL, { responseType: "arraybuffer", timeout: 20000 });

    res.setHeader("Content-Type", "image/png");
    return res.send(Buffer.from(response.data));
  } catch (err) {
    console.error("Erro musify:", err.message);
    return res.status(500).json({
      status: "error",
      message: "Erro interno ao gerar musify",
      detail: err.message
    });
  }
});

module.exports = router;