const express = require("express");
const axios = require("axios");
const router = express.Router();

// 📝 Informações padrão da API
const API_NOTE = {
  api: "API desenvolvida pela Neext",
  instagram: "@neet.tk"
};

/**
 * 🎨 /paint — Aplica efeito Paint na imagem
 * Endpoint base:
 * https://neextltda-canvas-api.hf.space/paint?image=URL
 */
router.get("/", async (req, res) => {
  const image = req.query.image;

  if (!image) {
    return res.status(400).json({
      ...API_NOTE,
      status: "error",
      message: 'Parâmetro "image" é obrigatório'
    });
  }

  try {
    // Faz requisição como stream
    const response = await axios.get(
      `https://neextltda-canvas-api.hf.space/paint`,
      {
        params: { image },
        responseType: "stream",
      }
    );

    res.setHeader("Content-Type", "image/png");
    response.data.pipe(res);
  } catch (error) {
    console.error("Erro no paint:", error.message);

    return res.status(500).json({
      ...API_NOTE,
      status: "error",
      message: "Erro ao gerar imagem"
    });
  }
});

module.exports = router;