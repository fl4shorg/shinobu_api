const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { username, avatar, level, background } = req.query;

    if (!username || !avatar || !level || !background) {
      return res.status(400).json({
        error: "Parâmetros obrigatórios: username, avatar, level, background"
      });
    }

    const url =
      `https://neextltda-canvas-api.hf.space/knights/levelup` +
      `?username=${encodeURIComponent(username)}` +
      `&avatar=${encodeURIComponent(avatar)}` +
      `&level=${encodeURIComponent(level)}` +
      `&background=${encodeURIComponent(background)}`;

    const response = await axios.get(url, { responseType: "arraybuffer" });

    res.setHeader("Content-Type", "image/png");
    res.send(response.data);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erro interno ao gerar o levelup" });
  }
});

module.exports = router;