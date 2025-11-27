/*
 * Apple Music Downloader + Search API + PlayAppleMusic (versão 2025)
 * Nova API: https://theresapis.vercel.app
 * Adaptado por Flash ⚡
 */

const express = require("express");
const axios = require("axios");

const router = express.Router();

// 🔹 Função principal usando a nova API
async function getAppleMusic(url) {
  const endpoint = "https://theresapis.vercel.app/download/applemusic";

  const response = await axios.get(endpoint, {
    params: { url },
    headers: { accept: "*/*" }
  });

  const data = response.data;

  if (!data?.status) throw new Error("Falha ao baixar música (API retornou erro).");

  return {
    title: data.title,
    artist: data.artist,
    album: data.album,
    artwork: data.cover,
    audio: data.audio,
    url: data.url
  };
}

// 🔹 Rota /apple (download pelo link)
router.get("/", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url)
      return res.json({ error: "Use: /apple?url=<link-do-apple-music>" });

    const info = await getAppleMusic(url);

    res.json({
      status: true,
      title: info.title,
      artist: info.artist,
      album: info.album,
      artwork: info.artwork,
      url: info.url,
      mp3: info.audio
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// 🔹 Rota /apple/search (buscar música pelo nome)
router.get("/search", async (req, res) => {
  try {
    const { term } = req.query;

    if (!term)
      return res.json({ error: "Use: /apple/search?term=<nome-da-musica>" });

    const query = encodeURIComponent(term);
    const url = `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`;

    const response = await axios.get(url);
    const results = response.data.results;

    if (!results || results.length === 0)
      return res.json({ status: false, message: "Nenhuma música encontrada." });

    const song = results[0];

    res.json({
      status: true,
      artist: song.artistName,
      track: song.trackName,
      album: song.collectionName,
      preview: song.previewUrl,
      artwork: song.artworkUrl100,
      trackView: song.trackViewUrl
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// 🔹 Rota /apple/play → busca + download automático
router.get("/play", async (req, res) => {
  try {
    const { term } = req.query;

    if (!term)
      return res.json({ error: "Use: /apple/play?term=<nome-da-musica>" });

    // 🔍 Pesquisa música
    const query = encodeURIComponent(term);
    const searchUrl = `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`;
    const searchResponse = await axios.get(searchUrl);
    const results = searchResponse.data.results;

    if (!results || results.length === 0)
      return res.json({ status: false, message: "Nenhuma música encontrada." });

    const song = results[0];

    // 🔽 Usa a nova API para baixar automaticamente
    const downloadInfo = await getAppleMusic(song.trackViewUrl);

    res.json({
      status: true,
      artist: song.artistName,
      track: song.trackName,
      album: song.collectionName,
      preview: song.previewUrl,
      artwork: song.artworkUrl100,
      trackView: song.trackViewUrl,
      download: {
        mp3: downloadInfo.audio,
        cover: downloadInfo.artwork
      }
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

module.exports = router;