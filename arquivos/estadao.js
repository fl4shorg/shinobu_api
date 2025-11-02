const express = require("express");
const axios = require("axios");

const router = express.Router();

const useragent_1 = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
};

router.get("/", async (req, res) => {
  try {
    // Endpoint de notícias do Estadão (exemplo: página inicial)
    const response = await axios.get("https://www.estadao.com.br/", {
      headers: { ...useragent_1 }
    });

    const html = response.data;

    // Extraindo notícias via regex simplificada, adaptada ao JSON do site
    // Procurando URLs de imagens + títulos + links
    const noticiaRegex = /"originalUrl":"(https?:\/\/[^"]+\.(?:jpg|jpeg|png))".*?"caption":"([^"]+)"/g;
    const linkRegex = /"originalUrl":"(https?:\/\/[^"]+\.(?:jpg|jpeg|png))".*?"_id":"([^"]+)"/g;

    const noticias = [];
    let match;

    while ((match = noticiaRegex.exec(html)) !== null) {
      let imagem = match[1];
      const desc = match[2];

      // Remove .webp do final caso exista
      if (imagem.includes(".webp")) imagem = imagem.replace(/\.webp.*$/, "");

      // Link fictício baseado no ID, para o exemplo
      const link = `https://www.estadao.com.br/noticias/${match[2] || "noticia"}`;

      noticias.push({
        noticia: desc,
        imagem,
        desc,
        link
      });
    }

    res.json({
      status: true,
      fonte: "https://www.estadao.com.br/",
      total: noticias.length,
      resultados: noticias
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Erro ao obter notícias do Estadão",
      erro: err.message
    });
  }
});

module.exports = router;