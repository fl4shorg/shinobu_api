const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();
const default_criador = "© neext ltda";

const useragent_1 = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
};

// Função para limpar HTML
function unescapeHtml(str) {
  if (!str) return "";
  return str.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
}

const defaultImage = "https://telegra.ph/file/2003e814c68cf402903cf.jpg";

router.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://www.metropoles.com/", {
      headers: { ...useragent_1 }
    });

    const $ = cheerio.load(response.data);
    const dados = [];

    $("article").each((i, e) => {
      const noticiaEl = $(e).find("h3 a, h5 a, h2 a").first();
      const imagemEl = $(e).find("img").first();

      if (noticiaEl.attr("href") && noticiaEl.text().trim() !== "") {
        dados.push({
          noticia: unescapeHtml(noticiaEl.text().trim()),
          imagem: imagemEl.attr("src") || imagemEl.attr("data-src") || defaultImage,
          categoria: $(e).find(".WidgetMaisLidasWrapper__TextLabel-sc-qh5njc-8, .NoticiaWrapper__Categoria-sc-1vgx9gu-4").first().text().trim() || null,
          link: noticiaEl.attr("href").startsWith("http") ? noticiaEl.attr("href") : `https://www.metropoles.com${noticiaEl.attr("href")}`
        });
      }
    });

    res.json({
      status: response.status,
      fonte: "https://www.metropoles.com/",
      criador: default_criador,
      resultado: dados
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;