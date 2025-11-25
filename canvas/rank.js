const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { username, avatar, level, needxp, currxp, background } = req.query;

    // validação dos parâmetros obrigatórios
    if (!username || !avatar || !level || !needxp || !currxp || !background) {
      return res.status(400).json({
        error: "Parâmetros obrigatórios faltando. Envie: username, avatar, level, needxp, currxp, background"
      });
    }

    const url = `https://neextltda-canvas-api.hf.space/knights/rank?username=${encodeURIComponent(
      username
    )}&avatar=${encodeURIComponent(
      avatar
    )}&level=${encodeURIComponent(
      level
    )}&needxp=${encodeURIComponent(
      needxp
    )}&currxp=${encodeURIComponent(
      currxp
    )}&background=${encodeURIComponent(background)}`;

    const response = await axios.get(url, {
      responseType: "arraybuffer"
    });

    res.setHeader("Content-Type", "image/png");
    res.send(response.data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno ao gerar imagem de rank" });
  }
});

module.exports = router;