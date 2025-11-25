const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { title, artist, cover, wallpaper, minutes, seconds, color } = req.query;

    if (!title || !artist || !cover || !wallpaper) {
      return res.status(400).json({
        error: "Parâmetros obrigatórios faltando: title, artist, cover, wallpaper"
      });
    }

    const url =
      `https://neextltda-canvas-api.hf.space/musicard/vector` +
      `?title=${encodeURIComponent(title)}` +
      `&artist=${encodeURIComponent(artist)}` +
      `&cover=${encodeURIComponent(cover)}` +
      `&wallpaper=${encodeURIComponent(wallpaper)}` +
      `&minutes=${encodeURIComponent(minutes || "0")}` +
      `&seconds=${encodeURIComponent(seconds || "0")}` +
      `&color=${encodeURIComponent(color || "#FFFFFF")}`;

    const response = await axios.get(url, { responseType: "arraybuffer", timeout: 20000 });

    res.setHeader("Content-Type", "image/png");
    return res.send(response.data);

  } catch (err) {
    console.error("Erro musicardvector:", err.message);
    return res.status(500).json({ error: "Erro interno ao gerar Musicard Vector" });
  }
});

module.exports = router;