const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  const {
    nome,
    velocidade,
    sistema = "",
    latencia = "",
    ping = "",
    pingLoss = "",
    upload = "",
    download = "",
    wallpaper = "",
    perfil = ""
  } = req.query;

  if (!nome || !velocidade) {
    return res.status(400).json({ error: "Parâmetros 'nome' e 'velocidade' são obrigatórios." });
  }

  try {
    const baseUrl = "https://pingapi-295qrbz7s-neext.vercel.app/api/og";

    const params = new URLSearchParams({
      nome,
      velocidade,
      sistema,
      latencia,
      ping,
      pingLoss,
      upload,
      download,
      wallpaper,
      perfil
    });

    const finalUrl = `${baseUrl}?${params.toString()}`;

    // Faz a requisição para a API externa como STREAM
    const response = await axios.get(finalUrl, { responseType: "stream" });

    // Repassa Content-Type e envia o stream diretamente
    res.setHeader("Content-Type", response.headers["content-type"] || "image/png");
    response.data.pipe(res);

  } catch (err) {
    console.error("Erro ao gerar imagem:", err.message);
    return res.status(500).json({ error: "Erro ao gerar imagem." });
  }
});

module.exports = router;