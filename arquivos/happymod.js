const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");

// ======================================================
// FUNÇÃO SCRAPER (A QUE VOCÊ DISSE QUE FUNCIONA)
// ======================================================
async function happyMod(query = "") {
  try {
    const url = `https://id.happymod.cloud/search.html?q=${encodeURIComponent(query)}`;
    const res = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(res.data);
    const results = [];

    $("li.list-item").each((i, el) => {
      const box = $(el).find("a.list-box");
      const title = box.find(".list-info-title").text().trim();
      const link = box.attr("href");

      if (!link) return;

      const page_dl = `https://id.happymod.cloud${link}original-downloading.html`;
      const packageName = link.split("/")[2] || null;
      const version = box
        .find(".list-info-text")
        .first()
        .find("span")
        .eq(0)
        .text()
        .trim();
      const size = box
        .find(".list-info-text")
        .first()
        .find("span")
        .eq(2)
        .text()
        .trim();

      const modInfo = box
        .find(".list-info-text")
        .eq(1)
        .text()
        .trim();

      results.push({
        title,
        package: packageName,
        version,
        size,
        modInfo,
        page_dl,
      });
    });

    return results;
  } catch (err) {
    return { error: err.message };
  }
}

// ======================================================
// GET /happymod?search=
// ======================================================
router.get("/", async (req, res) => {
  const { search } = req.query;

  if (!search)
    return res.status(400).json({
      status: false,
      error: "Parameter 'search' is required"
    });

  const data = await happyMod(search.trim());

  res.json({
    status: true,
    data,
    timestamp: new Date().toISOString(),
  });
});

// ======================================================
// POST /happymod  { "search": "kinemaster" }
// ======================================================
router.post("/", async (req, res) => {
  const { search } = req.body;

  if (!search)
    return res.status(400).json({
      status: false,
      error: "Parameter 'search' is required"
    });

  const data = await happyMod(search.trim());

  res.json({
    status: true,
    data,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;