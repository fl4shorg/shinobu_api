const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { avatar, username, level, rank, currentXP, requiredXP } = req.query;

    if (!avatar || !username || !level || !rank || !currentXP || !requiredXP) {
      return res.status(400).json({
        error: "Parâmetros obrigatórios: avatar, username, level, rank, currentXP, requiredXP"
      });
    }

    const url =
      `https://neextltda-canvas-api.hf.space/rank` +
      `?avatar=${encodeURIComponent(avatar)}` +
      `&username=${encodeURIComponent(username)}` +
      `&level=${encodeURIComponent(level)}` +
      `&rank=${encodeURIComponent(rank)}` +
      `&currentXP=${encodeURIComponent(currentXP)}` +
      `&requiredXP=${encodeURIComponent(requiredXP)}`;

    const response = await axios.get(url, { responseType: "arraybuffer" });

    res.setHeader("Content-Type", "image/png");
    res.send(response.data);

  } catch (err) {
    console.log("Erro no rank2:", err.message);
    res.status(500).json({ error: "Erro interno ao gerar Rank2" });
  }
});

module.exports = router;