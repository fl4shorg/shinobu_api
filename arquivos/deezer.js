// deezer.js — Pesquisa músicas usando a API oficial do Deezer
const express = require("express");
const axios = require("axios");
const router = express.Router();

const default_criador = "© neext ltda";
const useragent_1 = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
};
const defaultImage = "https://telegra.ph/file/2003e814c68cf402903cf.jpg";

// Função principal para buscar música
async function buscarMusica(nome) {
  try {
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(nome)}`;
    const { data } = await axios.get(url, { headers: useragent_1 });

    if (!data || !data.data || data.data.length === 0)
      return { status: 404, resultado: "Nenhum resultado encontrado" };

    const tracks = data.data.map(track => ({
      id: track.id,
      titulo: track.title,
      artista: track.artist?.name || "Desconhecido",
      album: track.album?.title || "Desconhecido",
      link: track.link || `https://www.deezer.com/track/${track.id}`,
      imagem: track.album?.cover_medium || defaultImage,
      preview: track.preview || null
    }));

    return {
      status: 200,
      fonte: "https://api.deezer.com",
      criador: default_criador,
      total: data.total || tracks.length,
      resultado: tracks
    };
  } catch (err) {
    return { status: 500, error: err.message };
  }
}

// Rota principal: /deezer?nome=...
router.get("/", async (req, res) => {
  try {
    const nome = req.query.nome;
    if (!nome)
      return res.status(400).json({ status: false, error: "Você precisa passar a query ?nome=" });

    const resultados = await buscarMusica(nome);
    res.json(resultados);
  } catch (err) {
    res.status(500).json({ status: false, error: err.toString() });
  }
});

module.exports = router;