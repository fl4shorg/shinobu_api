const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { title, artist, cover, wallpaper, minutes, seconds, color } = req.query;

    if (!title || !artist || !cover || !wallpaper || !minutes || !seconds || !color) {
      return res.status(400).json({
        error: "Parâmetros obrigatórios faltando: title, artist, cover, wallpaper, minutes, seconds, color"
      });
    }

    const url =
      `https://neextltda-canvas-api.hf.space/musicard/quartz`
      + `?title=${encodeURIComponent(title)}`
      + `&artist=${encodeURIComponent(artist)}`
      + `&cover=${encodeURIComponent(cover)}`
      + `&wallpaper=${encodeURIComponent(wallpaper)}`
      + `&minutes=${encodeURIComponent(minutes)}`
      + `&seconds=${encodeURIComponent(seconds)}`
      + `&color=${encodeURIComponent(color)}`;

    const response = await axios.get(url, { responseType: "arraybuffer" });

    res.setHeader("Content-Type", "image/png");
    res.send(response.data);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Erro interno ao gerar Musicard Quartz"
    });
  }
});

module.exports = router;