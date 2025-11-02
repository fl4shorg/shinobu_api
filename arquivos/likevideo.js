// arquivos/likevideo.js
const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/download/likevideo", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Faltando parâmetro: ?url=" });
  }

  try {
    const apiUrl = `https://nayan-video-downloader.vercel.app/likee?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);

    // Se deu erro na API
    if (data.status !== 200 || !data.data) {
      return res.status(404).json({
        status: false,
        mensagem: data.msg || "Vídeo não encontrado ou link inválido",
      });
    }

    // Extrai apenas o conteúdo importante
    const {
      title,
      thumbnail,
      withoutwatermark,
      withWatermark,
      video_count,
      like_count,
      comment_count,
      share_count,
      uploadDate,
      musicName,
    } = data.data;

    // Retorna limpo e formatado
    res.json({
      status: true,
      plataforma: "likee",
      titulo: title,
      capa: thumbnail,
      sem_marca: withoutwatermark,
      com_marca: withWatermark,
      estatisticas: {
        visualizacoes: video_count,
        curtidas: like_count,
        comentarios: comment_count,
        compartilhamentos: share_count,
      },
      data_upload: uploadDate,
      musica: musicName,
    });
  } catch (error) {
    console.error("Erro no likevideo:", error.message);
    res.status(500).json({ status: false, erro: "Falha ao buscar vídeo" });
  }
});

module.exports = router;