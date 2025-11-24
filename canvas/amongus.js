const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { text } = req.query;

    if (!text) {
      return res.status(400).json({
        error: "Parâmetro obrigatório faltando: text"
      });
    }

    const url = `https://api.lolhuman.xyz/api/amongus?apikey=1b0ebf01de8b0fbd59270f27&text=${encodeURIComponent(text)}`;

    const response = await axios.get(url, { responseType: "arraybuffer" });

    res.setHeader("Content-Type", "image/png");
    res.send(response.data);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Erro interno ao gerar efeito Among Us"
    });
  }
});

module.exports = router;