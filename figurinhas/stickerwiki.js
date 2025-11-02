const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

// ==== Caches de cada coleção ====
let cacheDexter = [];
let cacheElite = [];
let cacheMonkey = [];
let cacheCaracal = [];
let cacheDiario = [];
let cacheSuperman = [];
let cachePeaky = [];
let cacheUndertale = [];
let cacheKolobki = [];
let cacheHomelandee = [];
let cacheMashaurso = [];
let cacheGenshin = [];
let cacheZenitsu = [];
let cacheEuphoria = [];

// ==== Função genérica para buscar figurinhas ====
async function getStickers(url, nomeColecao) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
      },
      timeout: 10000, // 10s timeout
    });

    // Limitar até o início da seção "Categorias"
    const containerHtml = data.split('<h2 class="text-lg font-bold">Categorias:</h2>')[0];
    const $ = cheerio.load(containerHtml);

    const stickers = [];
    $("img").each((_, el) => {
      const src = $(el).attr("src");
      const alt = $(el).attr("alt") || `${nomeColecao} Sticker`;
      if (!src || !src.includes("assets.stickerswiki.app")) return;
      stickers.push({
        name: alt.trim(),
        url: src.startsWith("http") ? src : `https:${src}`,
      });
    });

    return stickers;
  } catch (err) {
    console.error(`Erro ao buscar figurinhas ${nomeColecao}:`, err.message);
    return [];
  }
}

// ==== Função para enviar figurinha aleatória sem repetir ====
async function sendRandomImage(res, stickers, cache) {
  try {
    if (!stickers.length) {
      return res.status(404).json({
        success: false,
        message: "Nenhuma figurinha encontrada."
      });
    }

    const filtered = stickers.filter(s => !cache.some(c => c.url === s.url));
    const available = filtered.length ? filtered : (cache.length = 0, stickers);
    const random = available[Math.floor(Math.random() * available.length)];
    cache.push(random);

    const response = await axios.get(random.url, { responseType: "stream" });
    res.setHeader("Content-Type", "image/webp");
    response.data.pipe(res);
  } catch (err) {
    console.error("Erro ao enviar figurinha:", err.message);
    res.status(500).json({
      success: false,
      message: "Erro ao carregar figurinha.",
      error: err.message
    });
  }
}

// ==== Definição das coleções ====
const collections = [
  { name: "dexter", url: "https://stickers.wiki/pt/whatsapp/the_dexter/", cache: cacheDexter },
  { name: "elite", url: "https://stickers.wiki/pt/whatsapp/elitelunelish_by_demybot/", cache: cacheElite },
  { name: "monkey", url: "https://stickers.wiki/pt/whatsapp/moonkeyy/", cache: cacheMonkey },
  { name: "caracal", url: "https://stickers.wiki/pt/telegram/bigfloppasshole_by_fstikbot/", cache: cacheCaracal },
  { name: "diario", url: "https://stickers.wiki/pt/telegram/vampirediariesir/", cache: cacheDiario },
  { name: "superman", url: "https://stickers.wiki/pt/telegram/kal_el_superman_by_demybot/", cache: cacheSuperman },
  { name: "peaky-blinders", url: "https://stickers.wiki/pt/telegram/peaky_biinders/", cache: cachePeaky },
  { name: "undertale", url: "https://stickers.wiki/pt/telegram/undertalezoer/", cache: cacheUndertale },
  { name: "kolobki", url: "https://stickers.wiki/pt/telegram/kolobki_real/", cache: cacheKolobki },
  { name: "homelandee", url: "https://stickers.wiki/pt/telegram/homelander_by_stickdlbot/", cache: cacheHomelandee },
  { name: "mashaurso", url: "https://stickers.wiki/pt/telegram/mashapict2/", cache: cacheMashaurso },
  { name: "genshin", url: "https://stickers.wiki/pt/telegram/genshingayshitimpact/", cache: cacheGenshin },
  { name: "zenitsu", url: "https://stickers.wiki/pt/telegram/ikgfghpekh_by_demybot/", cache: cacheZenitsu },
  { name: "euphoria", url: "https://stickers.wiki/pt/telegram/euphoriamgs_by_fstikbot/", cache: cacheEuphoria },
];

// ==== Criação dinâmica das rotas ====
collections.forEach(col => {
  // Rota da figurinha aleatória (local stream)
  router.get(`/${col.name}`, async (req, res) => {
    const stickers = await getStickers(col.url, col.name);
    await sendRandomImage(res, stickers, col.cache);
  });

  // Rota JSON com todas as figurinhas
  router.get(`/${col.name}/list`, async (req, res) => {
    const stickers = await getStickers(col.url, col.name);
    res.json({
      success: true,
      count: stickers.length,
      stickers
    });
  });
});

module.exports = router;