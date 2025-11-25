const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { title, artist, album, image } = req.query;

    if (!title || !artist || !album || !image) {
      return res.status(400).json({
        error: "Parâmetros obrigatórios: title, artist, album, image"
      });
    }

    const url =
      `https://neextltda-canvas-api.hf.space/spotify` +
      `?title=${encodeURIComponent(title)}` +
      `&artist=${encodeURIComponent(artist)}` +
      `&album=${encodeURIComponent(album)}` +
      `&image=${encodeURIComponent(image)}`;

    const response = await axios.get(url, { responseType: "arraybuffer" });

    res.setHeader("Content-Type", "image/png");
    res.send(response.data);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erro interno ao gerar o cartão do Spotify" });
  }
});

module.exports = router;