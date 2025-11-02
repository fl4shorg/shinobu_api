const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

let cacheBlue = [];
let cacheViolet = [];
let cacheYellow = [];
let cacheRed = [];
let cachePink = [];
let cacheTeal = [];
let cacheGreen = [];
let cacheWhite = [];
let cacheBlack = [];

// Função genérica para buscar figurinhas por cor
async function getStickers(filter = "blue") {
  try {
    const { data } = await axios.get("https://bluemoji.io/");
    const $ = cheerio.load(data);
    const stickers = [];

    $("img").each((_, el) => {
      const alt = $(el).attr("alt") || "";
      const src = $(el).attr("src");
      const parent = $(el).closest("a");

      if (!src || !src.includes("/cdn-proxy/")) return;

      const imgUrl = src.startsWith("/")
        ? `https://bluemoji.io${src}`
        : src;

      // 🔵 Blue
      if (filter === "blue" && parent.attr("class")?.includes("is-blue")) {
        stickers.push({ name: alt.trim() || "Blue Emoji", url: imgUrl });
      }

      // 🟣 Violet
      if (filter === "violet" && parent.attr("class")?.includes("is-violet")) {
        stickers.push({ name: alt.trim() || "Violet Emoji", url: imgUrl });
      }

      // 🟡 Yellow
      if (filter === "yellow" && parent.attr("class")?.includes("is-yellow")) {
        stickers.push({ name: alt.trim() || "Yellow Emoji", url: imgUrl });
      }

      // 🔴 Red
      if (filter === "red" && parent.attr("class")?.includes("is-red")) {
        stickers.push({ name: alt.trim() || "Red Emoji", url: imgUrl });
      }

      // 💗 Pink
      if (filter === "pink" && parent.attr("class")?.includes("is-pink")) {
        stickers.push({ name: alt.trim() || "Pink Emoji", url: imgUrl });
      }

      // 🟦 Teal
      if (filter === "teal" && parent.attr("class")?.includes("is-teal")) {
        stickers.push({ name: alt.trim() || "Teal Emoji", url: imgUrl });
      }

      // 🟢 Green
      if (filter === "green" && parent.attr("class")?.includes("is-green")) {
        stickers.push({ name: alt.trim() || "Green Emoji", url: imgUrl });
      }

      // ⚪ White
      if (filter === "white" && parent.attr("class")?.includes("is-white")) {
        stickers.push({ name: alt.trim() || "White Emoji", url: imgUrl });
      }

      // ⚫ Black
      if (filter === "black" && parent.attr("class")?.includes("is-black")) {
        stickers.push({ name: alt.trim() || "Black Emoji", url: imgUrl });
      }
    });

    return stickers;
  } catch (err) {
    console.error("Erro ao buscar figurinhas:", err.message);
    return [];
  }
}

// Função para retornar imagem aleatória e evitar repetição
async function sendRandomImage(res, stickers, cache) {
  try {
    if (stickers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Nenhuma figurinha encontrada.",
      });
    }

    const filtered = stickers.filter((s) => !cache.some((c) => c.url === s.url));
    const available = filtered.length ? filtered : ((cache.length = 0), stickers);
    const random = available[Math.floor(Math.random() * available.length)];
    cache.push(random);

    const response = await axios.get(random.url, { responseType: "stream" });
    res.setHeader("Content-Type", "image/png");
    response.data.pipe(res);
  } catch (err) {
    console.error("Erro ao enviar imagem:", err.message);
    res.status(500).json({
      success: false,
      message: "Erro ao carregar figurinha.",
      error: err.message,
    });
  }
}

// === Rotas por cor ===
router.get("/blue", async (req, res) => await sendRandomImage(res, await getStickers("blue"), cacheBlue));
router.get("/violet", async (req, res) => await sendRandomImage(res, await getStickers("violet"), cacheViolet));
router.get("/yellow", async (req, res) => await sendRandomImage(res, await getStickers("yellow"), cacheYellow));
router.get("/red", async (req, res) => await sendRandomImage(res, await getStickers("red"), cacheRed));
router.get("/pink", async (req, res) => await sendRandomImage(res, await getStickers("pink"), cachePink));
router.get("/teal", async (req, res) => await sendRandomImage(res, await getStickers("teal"), cacheTeal));
router.get("/green", async (req, res) => await sendRandomImage(res, await getStickers("green"), cacheGreen));
router.get("/white", async (req, res) => await sendRandomImage(res, await getStickers("white"), cacheWhite));
router.get("/black", async (req, res) => await sendRandomImage(res, await getStickers("black"), cacheBlack));

// === Listas JSON ===
router.get("/:color/list", async (req, res) => {
  const color = req.params.color.toLowerCase();
  const validColors = ["blue","violet","yellow","red","pink","teal","green","white","black"];
  if (!validColors.includes(color)) return res.status(400).json({ success: false, message: "Cor inválida." });

  const stickers = await getStickers(color);
  res.json({ success: true, theme: color.charAt(0).toUpperCase() + color.slice(1), count: stickers.length, stickers });
});

// === Lista completa ===
router.get("/all/list", async (req, res) => {
  const blue = await getStickers("blue");
  const violet = await getStickers("violet");
  const yellow = await getStickers("yellow");
  const red = await getStickers("red");
  const pink = await getStickers("pink");
  const teal = await getStickers("teal");
  const green = await getStickers("green");
  const white = await getStickers("white");
  const black = await getStickers("black");

  res.json({
    success: true,
    message: "Todas as figurinhas carregadas.",
    total: blue.length + violet.length + yellow.length + red.length + pink.length + teal.length + green.length + white.length + black.length,
    themes: { blue, violet, yellow, red, pink, teal, green, white, black }
  });
});

module.exports = router;