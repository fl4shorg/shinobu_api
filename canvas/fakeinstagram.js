const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { avatar, username, postImage, theme, verified } = req.query;

    if (!avatar || !username || !postImage) {
      return res.status(400).json({
        error: "Parâmetros obrigatórios faltando: avatar, username, postImage"
      });
    }

    const url =
      `https://neextltda-canvas-api.hf.space/instagram` +
      `?avatar=${encodeURIComponent(avatar)}` +
      `&username=${encodeURIComponent(username)}` +
      `&postImage=${encodeURIComponent(postImage)}` +
      `&theme=${encodeURIComponent(theme || "dark")}` +
      `&verified=${encodeURIComponent(verified || "false")}`;

    const response = await axios.get(url, {
      responseType: "arraybuffer"
    });

    res.setHeader("Content-Type", "image/png");
    res.send(response.data);

  } catch (e) {
    console.log(e);
    res.status(500).json({
      error: "Erro interno ao gerar Fake Instagram"
    });
  }
});

module.exports = router;