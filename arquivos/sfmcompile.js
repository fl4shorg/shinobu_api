const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

// Categorias e URLs base
const categories = {
  top: "https://sfmcompile.club/?filter-by=popular",
  long: "https://sfmcompile.club/tag/20secs,30secs,1min+,2mins+,3mins+,4mins+,5mins+,9mins+/",
  kiriko: "https://sfmcompile.club/category/overwatch/kiriko/",
  ana: "https://sfmcompile.club/category/overwatch/ana/",
  ashe: "https://sfmcompile.club/category/overwatch/ashe/",
  brigitte: "https://sfmcompile.club/category/overwatch/brigitte/",
  dva: "https://sfmcompile.club/category/overwatch/dva/",
  mei: "https://sfmcompile.club/category/overwatch/mei/",
  mercy: "https://sfmcompile.club/category/overwatch/mercy/",
  pharah: "https://sfmcompile.club/category/overwatch/pharah/",
  sombra: "https://sfmcompile.club/category/overwatch/sombra/",
  symmetra: "https://sfmcompile.club/category/overwatch/symmetra/",
  tracer: "https://sfmcompile.club/category/overwatch/tracer/",
  widowmaker: "https://sfmcompile.club/category/overwatch/widowmaker/",
  fortnite: "https://sfmcompile.club/category/fortnite/",
  marvel: "https://sfmcompile.club/category/marvel/",
  witcher: "https://sfmcompile.club/category/marvel/",
  cyberpunk: "https://sfmcompile.club/category/cyberpunk-2077/",
  laracroft: "https://sfmcompile.club/category/lara-croft/",
  lifeisstrange: "https://sfmcompile.club/category/life-is-strange/",
  zelda: "https://sfmcompile.club/category/zelda/",
  mortalkombat: "https://sfmcompile.club/category/mortal-kombat/",
  zarya: "https://sfmcompile.club/category/overwatch/zarya/"
};

// Função que pega um link de vídeo aleatório da página
async function getRandomVideoLink(baseUrl) {
  try {
    const randomPage = Math.floor(Math.random() * 25) + 1; // página aleatória
    const url = `${baseUrl}page/${randomPage}/`;

    const { data } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const $ = cheerio.load(data);

    const videos = [];
    $("source[type='video/mp4']").each((_, el) => {
      const link = $(el).attr("src");
      if (link) videos.push(link);
    });

    if (videos.length === 0) throw new Error("Nenhum vídeo encontrado");

    // Retorna um link aleatório
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];
    return { url: randomVideo };
  } catch (err) {
    return { error: err.message };
  }
}

// Cria rota para cada categoria
Object.keys(categories).forEach((cat) => {
  router.get(`/${cat}`, async (req, res) => {
    const result = await getRandomVideoLink(categories[cat]);

    if (result.error) {
      return res.status(500).json({ status: false, error: result.error });
    }

    // Retorna JSON com o link direto
    res.json({ status: true, url: result.url });
  });
});

module.exports = router;