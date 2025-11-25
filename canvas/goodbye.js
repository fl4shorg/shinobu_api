const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { username, guildName, guildIcon, memberCount, avatar, background } = req.query;

    if (!username || !guildName || !guildIcon || !memberCount || !avatar || !background) {
      return res.status(400).json({
        error: "Parâmetros obrigatórios: username, guildName, guildIcon, memberCount, avatar, background"
      });
    }

    const url =
      `https://neextltda-canvas-api.hf.space/knights/goodbye` +
      `?username=${encodeURIComponent(username)}` +
      `&guildName=${encodeURIComponent(guildName)}` +
      `&guildIcon=${encodeURIComponent(guildIcon)}` +
      `&memberCount=${encodeURIComponent(memberCount)}` +
      `&avatar=${encodeURIComponent(avatar)}` +
      `&background=${encodeURIComponent(background)}`;

    const response = await axios.get(url, { responseType: "arraybuffer" });

    res.setHeader("Content-Type", "image/png");
    res.send(response.data);
  } catch (e) {
    console.log(e);
    res.status(500).json({
      error: "Erro interno ao gerar a imagem goodbye"
    });
  }
});

module.exports = router;