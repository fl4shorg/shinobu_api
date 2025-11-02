const express = require("express");
const axios = require("axios");

const router = express.Router();
const default_criador = "© neext ltda";

// Função para limpar strings
function unescapeHtml(str) {
  if (!str) return "";
  return str.replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"');
}

// Endpoint: /letramusic?title=nome+da+musica
router.get("/", async (req, res) => {
  try {
    const title = req.query.title;
    if (!title) return res.status(400).json({ error: "Você precisa passar a query ?title=" });

    const url = `https://lyrics.lewdhutao.my.eu.org/v2/youtube/lyrics?title=${encodeURIComponent(title)}`;

    const { data } = await axios.get(url);

    // Se não tiver letra
    if (!data || !data.lyrics) {
      return res.json({
        status: 404,
        fonte: "https://lyrics.lewdhutao.my.eu.org/",
        criador: default_criador,
        query: title,
        resultado: "Letra não encontrada"
      });
    }

    res.json({
      status: 200,
      fonte: "https://lyrics.lewdhutao.my.eu.org/",
      criador: default_criador,
      query: title,
      resultado: {
        titulo: unescapeHtml(data.title || "Sem título"),
        artista: unescapeHtml(data.author || "Desconhecido"),
        letra: unescapeHtml(data.lyrics || "Sem letra"),
        thumbnail: data.thumbnail || null
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;