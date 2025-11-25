const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { avatar1, avatar2, username1, username2, percentage } = req.query;

    if (!avatar1 || !avatar2 || !username1 || !username2) {
      return res.status(400).json({
        error: "Parâmetros obrigatórios faltando: avatar1, avatar2, username1, username2"
      });
    }

    const url =
      `https://neextltda-canvas-api.hf.space/ship` +
      `?avatar1=${encodeURIComponent(avatar1)}` +
      `&avatar2=${encodeURIComponent(avatar2)}` +
      `&username1=${encodeURIComponent(username1)}` +
      `&username2=${encodeURIComponent(username2)}` +
      `&percentage=${encodeURIComponent(percentage || "50")}`;

    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 20000
    });

    res.setHeader("Content-Type", "image/png");
    return res.send(response.data);

  } catch (err) {
    console.error("Erro ship:", err.message);
    return res.status(500).json({ error: "Erro interno ao gerar Ship" });
  }
});

module.exports = router;