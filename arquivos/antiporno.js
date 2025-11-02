const express = require("express");
const axios = require("axios");
const router = express.Router();

/**
 * Rota: GET /api/antiporno?url=https://exemplo.com/imagem.jpg
 */
router.get("/", async (req, res) => {
  const imageUrl = req.query.url;

  if (!imageUrl) {
    return res.status(400).json({ erro: "Faltando parâmetro 'url' da imagem." });
  }

  try {
    const apiUrl = `https://nsfw-demo.sashido.io/api/image/classify?url=${encodeURIComponent(imageUrl)}`;
    const response = await axios.get(apiUrl);

    const result = response.data;
    if (!result || !result.predictions) {
      return res.status(500).json({ erro: "Falha ao analisar imagem." });
    }

    const { porn, hentai, sexy, neutral, drawings } = result.predictions;

    // Limiar de detecção (ajustável)
    const isNsfw = porn > 0.5 || hentai > 0.5 || sexy > 0.5;

    res.json({
      sucesso: true,
      imagem: imageUrl,
      nsfw: isNsfw,
      confianca: { porn, hentai, sexy, neutral, drawings },
      mensagem: isNsfw ? "🚫 Conteúdo adulto detectado." : "✅ Imagem segura.",
    });
  } catch (erro) {
    console.error("Erro no antiporno:", erro.message);
    res.status(500).json({ erro: "Erro ao verificar imagem." });
  }
});

module.exports = router;