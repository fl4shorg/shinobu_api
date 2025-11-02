// arquivos/YouTube2.js
// • YouTube Downloader via Nayan API + Pesquisa MP3 • Desenvolvido por Neext •

const express = require("express");
const ytSearch = require("yt-search");
const axios = require("axios");

const router = express.Router();

// ===================== Download MP4 via Nayan API =====================
router.get("/download/mp4", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Parâmetro 'url' é obrigatório" });

  try {
    const apiUrl = `https://nayan-video-downloader.vercel.app/ytdown?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status) return res.status(500).json({ error: "Erro ao processar vídeo" });

    res.json({
      desenvolvido: "Neext",
      status: true,
      resultado: {
        title: data.data.title,
        thumbnail: data.data.thumb,
        video: data.data.video,
        video_hd: data.data.video_hd,
        quality: data.data.quality,
        channel: data.data.channel || "",
        description: data.data.desc || ""
      }
    });

  } catch (err) {
    console.error("Erro ao acessar API Nayan (MP4):", err.message);
    res.status(500).json({ error: "Erro interno", detalhes: err.message });
  }
});

// ===================== Download MP3 via Nayan API =====================
router.get("/download/mp3", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Parâmetro 'url' é obrigatório" });

  try {
    const apiUrl = `https://nayan-video-downloader.vercel.app/ytdown?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status) return res.status(500).json({ error: "Erro ao processar vídeo" });

    res.json({
      desenvolvido: "Neext",
      status: true,
      resultado: {
        title: data.data.title,
        thumbnail: data.data.thumb,
        audio: data.data.audio, // apenas MP3
        quality: data.data.quality,
        channel: data.data.channel || "",
        description: data.data.desc || ""
      }
    });

  } catch (err) {
    console.error("Erro ao acessar API Nayan (MP3):", err.message);
    res.status(500).json({ error: "Erro interno", detalhes: err.message });
  }
});

// ===================== Pesquisa e retorno do primeiro resultado MP3 (play2) =====================
router.get("/play2", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Parâmetro 'q' é obrigatório" });

  try {
    // Busca o primeiro vídeo no YouTube
    const result = await ytSearch(query);
    const video = result.videos[0];

    if (!video) return res.status(404).json({ error: "Nenhum vídeo encontrado" });

    // Pega link MP3 via Nayan apenas para o primeiro resultado
    const apiUrl = `https://nayan-video-downloader.vercel.app/ytdown?url=${encodeURIComponent(video.url)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status) return res.status(500).json({ error: "Erro ao processar vídeo" });

    res.json({
      desenvolvido: "Neext",
      status: true,
      resultado: {
        title: video.title,
        url: video.url,
        thumbnail: video.thumbnail,
        duration: video.timestamp,
        views: video.views,
        author: video.author.name,
        download_mp3: data.data.audio, // só o MP3
      }
    });

  } catch (err) {
    console.error("Erro na rota play2:", err.message);
    res.status(500).json({ error: "Erro interno", detalhes: err.message });
  }
});

module.exports = router;