const express = require("express");
const axios = require("axios");

const router = express.Router();

// Função que chama a API do Render
async function getPornhubVideo(url) {
  try {
    if (!url) throw new Error("URL não fornecida");

    const apiUrl = `https://pornhub-fjuz.onrender.com/pornhub?url=${encodeURIComponent(url)}`;

    const { data } = await axios.get(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Mobile Safari/537.36",
        "Accept": "application/json",
      },
      timeout: 20000,
    });

    if (!data || !data.video) throw new Error("Vídeo não encontrado");

    // Retorna apenas o link do vídeo e o campo desenvolvido_por
    return { video: data.video, desenvolvido_por: "Neext" };
  } catch (err) {
    console.error("Erro ao chamar a API do Render:", err.message);
    return { error: "Vídeo não encontrado", desenvolvido_por: "Neext" };
  }
}

// Endpoint GET /pornhub?url=
router.get("/", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      error: "Parâmetro 'url' não fornecido",
      desenvolvido_por: "Neext",
    });
  }

  const result = await getPornhubVideo(url);
  res.json(result);
});

module.exports = router;