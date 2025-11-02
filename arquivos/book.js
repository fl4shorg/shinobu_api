const express = require("express");
const axios = require("axios");

const router = express.Router();
const default_criador = "© neext ltda";
const defaultImage = "https://telegra.ph/file/2003e814c68cf402903cf.jpg";

// Função para limpar strings
function unescapeHtml(str) {
  if (!str) return "";
  return str.replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"');
}

// Endpoint: /book?q=harry+potter
router.get("/", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Você precisa passar a query ?q=" });

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;

    const { data } = await axios.get(url);

    const resultados = [];

    if (data.items && data.items.length > 0) {
      data.items.forEach(item => {
        const volume = item.volumeInfo;
        resultados.push({
          titulo: unescapeHtml(volume.title || "Sem título"),
          descricao: unescapeHtml(volume.description || "Sem descrição"),
          link: volume.infoLink || "#",
          imagem: volume.imageLinks?.thumbnail || defaultImage,
          autores: volume.authors || ["Desconhecido"],
          editora: volume.publisher || "Desconhecida",
          publicadoEm: volume.publishedDate || "Desconhecida"
        });
      });
    }

    res.json({
      status: 200,
      fonte: "https://www.googleapis.com/books/v1/volumes",
      criador: default_criador,
      query,
      resultado: resultados
    });

  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;