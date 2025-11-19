/*
 * Apple Music Downloader + Search API + PlayAppleMusic (versão 2025)
 * Fonte: https://api.siputzx.my.id
 * Adaptado por Flash ⚡
 */

const express = require("express");
const axios = require("axios");

const router = express.Router();

// 🔹 Função principal para baixar música
async function getAppleMusic(url) {
  const endpoint = "https://api.siputzx.my.id/api/d/musicapple";

  const response = await axios.get(endpoint, {
    params: { url },
    headers: {
      accept: "*/*",
      api_key: "neext" // tua chave de acesso
    }
  });

  const data = response.data;
  if (!data?.status) throw new Error("Falha ao obter dados da música.");

  return data.data;
}

// 🔹 Rota para download
router.get("/", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url)
      return res.json({ error: "Use: /apple?url=<link-do-apple-music>" });

    const info = await getAppleMusic(url);

    res.json({
      status: true,
      url: info.url,
      title: info.songTitle,
      artist: info.artist,
      artwork: info.artworkUrl,
      mp3: info.mp3DownloadLink,
      cover: info.coverDownloadLink
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// 🔹 Rota /apple/search para buscar música pelo nome
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

// 🔹 Nova rota /apple/play (PlayAppleMusic)
// Pesquisa pelo termo e retorna info + URL de download
router.get("/play", async (req, res) => {
  try {
    const { term } = req.query;
    if (!term)
      return res.json({ error: "Use: /apple/play?term=<nome-da-musica>" });

    // 🔹 Busca a música usando iTunes Search API
    const query = encodeURIComponent(term);
    const searchUrl = `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`;
    const searchResponse = await axios.get(searchUrl);
    const results = searchResponse.data.results;

    if (!results || results.length === 0)
      return res.json({ status: false, message: "Nenhuma música encontrada." });

    const song = results[0];

    // 🔹 Passa a URL da música para a função de download
    const downloadInfo = await getAppleMusic(song.trackViewUrl);

    // 🔹 Retorna informações combinadas
    res.json({
      status: true,
      artist: song.artistName,
      track: song.trackName,
      album: song.collectionName,
      preview: song.previewUrl,
      artwork: song.artworkUrl100,
      trackView: song.trackViewUrl,
      download: {
        mp3: downloadInfo.mp3DownloadLink,
        cover: downloadInfo.coverDownloadLink
      }
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

module.exports = router;