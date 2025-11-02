/*
 * Apple Music Downloader API (versão 2025)
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

// 🔹 Rota Express
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

module.exports = router;