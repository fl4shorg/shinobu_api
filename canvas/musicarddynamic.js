const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { title, artist, cover, wallpaper, progress, startTime, endTime } = req.query;

    if (!title || !artist || !cover || !wallpaper) {
      return res.status(400).json({
        error: "Parâmetros obrigatórios faltando: title, artist, cover, wallpaper"
      });
    }

    const url =
      `https://neextltda-canvas-api.hf.space/musicard2/dynamic` +
      `?title=${encodeURIComponent(title)}` +
      `&artist=${encodeURIComponent(artist)}` +
      `&cover=${encodeURIComponent(cover)}` +
      `&wallpaper=${encodeURIComponent(wallpaper)}` +
      `&progress=${encodeURIComponent(progress || "0")}` +
      `&startTime=${encodeURIComponent(startTime || "0:00")}` +
      `&endTime=${encodeURIComponent(endTime || "0:00")}`;

    const response = await axios.get(url, { responseType: "arraybuffer", timeout: 20000 });

    res.setHeader("Content-Type", "image/png");
    return res.send(response.data);
  } catch (err) {
    console.error("Erro musicarddynamic:", err.message);
    return res.status(500).json({ error: "Erro interno ao gerar Musicard Dynamic" });
  }
});

module.exports = router;