const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { avatar, username, background, groupname, member } = req.query;

    if (!avatar || !username || !background || !groupname || !member) {
      return res.status(400).json({
        error: "Parâmetros obrigatórios: avatar, username, background, groupname, member"
      });
    }

    const url = `https://neextltda-canvas-api.hf.space/knights/welcome2?avatar=${encodeURIComponent(
      avatar
    )}&username=${encodeURIComponent(username)}&background=${encodeURIComponent(
      background
    )}&groupname=${encodeURIComponent(groupname)}&member=${encodeURIComponent(member)}`;

    const response = await axios.get(url, { responseType: "arraybuffer" });

    res.setHeader("Content-Type", "image/png");
    res.send(response.data);
  } catch (e) {
    console.log(e);
    res.status(500).json({
      error: "Erro interno ao gerar efeito welcome2"
    });
  }
});

module.exports = router;