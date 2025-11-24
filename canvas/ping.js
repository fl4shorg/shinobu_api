const express = require("express");
const axios = require("axios");
const router = express.Router();

/* =====================================================
   🔵 ROTA /ping — repassa a imagem da API HuggingFace
   ===================================================== */
router.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      "https://neextltda-canvas-api.hf.space/ping",
      {
        params: req.query,
        responseType: "arraybuffer"
      }
    );

    // seta o tipo da imagem (png)
    res.set("Content-Type", "image/png");

    // envia o buffer direto
    return res.send(response.data);

  } catch (err) {
    console.error("Erro no ping:", err.message);

    return res.status(500).json({
      status: "error",
      message: "Falha ao gerar a imagem"
    });
  }
});

module.exports = router;