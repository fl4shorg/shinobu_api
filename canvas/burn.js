const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { avatar } = req.query;

    if (!avatar) {
      return res.status(400).json({
        error: "Parâmetro obrigatório: avatar"
      });
    }

    const url =
      `https://neextltda-canvas-api.hf.space/knights/burn` +
      `?avatar=${encodeURIComponent(avatar)}`;

    const response = await axios.get(url, { responseType: "arraybuffer" });

    res.setHeader("Content-Type", "image/png");
    res.send(response.data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno ao gerar efeito Burn" });
  }
});

module.exports = router;