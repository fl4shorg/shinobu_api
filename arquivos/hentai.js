const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const router = express.Router();

// Função para buscar o conteúdo de hentai
const getHentaiContent = async () => {
  const content = [];

  try {
    for (let page = 1; page <= 6; page++) {
      const url =
        page === 1
          ? "https://multi.xnxx.com/category/hentai/"
          : `https://multi.xnxx.com/category/hentai/p-${page}/`;

      const { data } = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        },
      });

      const $ = cheerio.load(data);

      $("img.thumb.img-responsive").each((i, el) => {
        const id = $(el).attr("data-id");
        const imageUrl = $(el).attr("src");
        const title = $(el).attr("alt") || `Hentai ${id}`;

        if (imageUrl) {
          content.push({ id, title, imageUrl });
        }
      });

      console.log(`Página ${page} processada.`);
    }

    return content;
  } catch (error) {
    console.error("Erro ao acessar o site:", error.message);
    return content;
  }
};

// Rota relativa
router.get("/", async (req, res) => {
  try {
    const content = await getHentaiContent();

    if (content.length === 0) {
      return res.status(404).send("Nenhum conteúdo encontrado.");
    }

    // Escolhe uma imagem aleatória
    const randomIndex = Math.floor(Math.random() * content.length);
    const randomImage = content[randomIndex];

    // Faz o download da imagem e envia via stream
    const response = await axios.get(randomImage.imageUrl, { responseType: "stream" });

    // Define o tipo de conteúdo correto
    res.setHeader("Content-Type", response.headers["content-type"]);

    // Envia a imagem diretamente
    response.data.pipe(res);
  } catch (error) {
    console.error("Erro na rota /api/hentai:", error.message);
    res.status(500).send("Erro ao buscar conteúdo.");
  }
});

module.exports = router;