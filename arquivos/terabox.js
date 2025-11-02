// arquivos/terabox.js
const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/terabox", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Faltando parâmetro: ?url=" });
  }

  try {
    const apiUrl = `https://nayan-video-downloader.vercel.app/terabox?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);

    // Pega diretamente o corpo útil da resposta
    const data =
      response.data?.resultado?.data ||
      response.data?.data ||
      response.data;

    // Validação simples
    if (!data || data.status === 404 || data.error) {
      return res.status(404).json({ status: false, erro: "Vídeo não encontrado ou inválido" });
    }

    // Retorna somente o conteúdo limpo
    res.json({
      status: true,
      ...data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, erro: "Falha ao buscar vídeo" });
  }
});

module.exports = router;