const express = require("express");
const axios = require("axios");

const router = express.Router();

// ==========================
// Rota: /lyrics/search
// Busca músicas por palavra-chave
// ==========================
router.get("/search", async (req, res) => {
  const { q, track_name, artist_name, album_name } = req.query;

  if (!q && !track_name) {
    return res.status(400).json({ error: "É necessário informar ao menos 'q' ou 'track_name'" });
  }

  try {
    const { data } = await axios.get("https://lrclib.net/api/search", {
      params: { q, track_name, artist_name, album_name },
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36"
      }
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar músicas", details: err.message });
  }
});

// ==========================
// Rota: /lyrics/get
// Retorna a letra completa de uma música específica
// ==========================
router.get("/get", async (req, res) => {
  const { artist_name, track_name, album_name, duration } = req.query;

  if (!artist_name || !track_name) {
    return res.status(400).json({ error: "Os parâmetros 'artist_name' e 'track_name' são obrigatórios" });
  }

  try {
    const { data } = await axios.get("https://lrclib.net/api/get", {
      params: { artist_name, track_name, album_name, duration },
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36"
      }
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar letra", details: err.message });
  }
});

module.exports = router;