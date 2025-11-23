/**
 * Spotify API da Neext
 * Pesquisa + Metadata + Download
 * Base: spotdown.org
 */

const express = require("express");
const axios = require("axios");
const router = express.Router();

const API_NOTE = {
  api: "API desenvolvida pela Neext",
  instagram: "@neet.tk"
};

/* =====================================================
   🟩 EXTRAI O ID DO LINK DO SPOTIFY
   ===================================================== */
function extractSpotifyID(url) {
  if (!url) return null;
  const match = url.match(/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

/* =====================================================
   🟩 1 — Função para pegar METADATA pelo Spotdown.org
   ===================================================== */
async function getSongDetails(urlOrName) {
  try {
    const response = await axios.get("https://spotdown.org/api/song-details", {
      params: { url: urlOrName },
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    return response.data;
  } catch (error) {
    console.error("Erro metadata:", error.message);
    throw new Error("Falha ao obter metadata da música");
  }
}

/* =====================================================
   🟩 2 — GERAR LINK DO DOWNLOAD (SEM BASE64)
   ===================================================== */
function generateDownloadLink(track) {
  const id = track.id || extractSpotifyID(track.url);
  if (!id) return null;

  const title = encodeURIComponent(track.title || "Unknown");
  const artist = encodeURIComponent(track.artist || "Unknown");

  return `https://cdn-spotify-247.zm.io.vn/download/${id}/syaiiganteng?name=${title}&artist=${artist}`;
}

/* =====================================================
   🔍 /search — retorna lista completa
   ===================================================== */
router.get("/search", async (req, res) => {
  const q = req.query.q;

  if (!q)
    return res.status(400).json({
      ...API_NOTE,
      status: "error",
      message: 'Parâmetro "q" é obrigatório'
    });

  try {
    const data = await getSongDetails(q);

    const results = data.songs || data.results || (data.result ? [data.result] : [data]);

    return res.status(200).json({
      ...API_NOTE,
      status: "success",
      results
    });

  } catch (e) {
    return res.status(500).json({
      ...API_NOTE,
      status: "error",
      message: e.message
    });
  }
});

/* =====================================================
   🔽 /download — metadata + link REAL
   ===================================================== */
router.get("/download", async (req, res) => {
  const url = req.query.url;

  if (!url)
    return res.status(400).json({
      ...API_NOTE,
      status: "error",
      message: 'Parâmetro "url" é obrigatório'
    });

  try {
    const meta = await getSongDetails(url);

    const track =
      meta.songs?.[0] ||
      meta.results?.[0] ||
      meta.result ||
      meta;

    const downloadLink = generateDownloadLink(track);

    return res.status(200).json({
      ...API_NOTE,
      status: "success",
      metadata: track,
      download: downloadLink
    });

  } catch (e) {
    return res.status(500).json({
      ...API_NOTE,
      status: "error",
      message: e.message
    });
  }
});

/* =====================================================
   ▶ /playspotify — pesquisa → pega 1º → retorna link
   ===================================================== */
router.get("/playspotify", async (req, res) => {
  const q = req.query.q;

  if (!q)
    return res.status(400).json({
      ...API_NOTE,
      status: "error",
      message: 'Parâmetro "q" é obrigatório'
    });

  try {
    const s = await getSongDetails(q);

    const track =
      s.songs?.[0] ||
      s.results?.[0] ||
      s.result ||
      s;

    if (!track)
      return res.status(404).json({
        ...API_NOTE,
        status: "error",
        message: "Nenhuma música encontrada"
      });

    const downloadLink = generateDownloadLink(track);

    return res.status(200).json({
      ...API_NOTE,
      status: "success",
      metadata: track,
      download: downloadLink
    });

  } catch (e) {
    return res.status(500).json({
      ...API_NOTE,
      status: "error",
      message: e.message
    });
  }
});

module.exports = router;