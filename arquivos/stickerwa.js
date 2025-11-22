const express = require("express");
const axios = require("axios");

const router = express.Router();

class Sticker {
  constructor() {
    this.BASE_URL = 'https://getstickerpack.com';
    this.ENDPOINT = 'https://getstickerpack.com/api/v1/stickerdb';
    this.STORAGE = 'https://s3.getstickerpack.com';
    this.headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      "Accept": "application/json",
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": "https://getstickerpack.com",
      "Origin": "https://getstickerpack.com"
    };
  }

  // Busca todos os stickers disponíveis para a query
  async search(query) {
    try {
      if (!query) throw new Error('Query is required');

      // Busca a primeira página
      let allData = [];
      let page = 1;
      let totalPages = 1;

      do {
        const res = await axios.post(`${this.ENDPOINT}/search`, { query, page }, { headers: this.headers }).then(r => r.data);
        const data = res.data.map(item => ({
          name: item.title,
          slug: item.slug,
          url: `${this.BASE_URL}/stickers/${item.slug}`,
          image: `${this.STORAGE}/${item.cover_image ? item.cover_image : item.tray_icon_large}`,
          download: item.download_counter,
          updated: item.updated_at,
          user: item.user,
        }));

        allData = allData.concat(data);

        totalPages = res.meta.total_pages || 1;
        page++;
      } while (page <= totalPages);

      return { status: true, data: allData, total: allData.length };
    } catch (e) {
      return { status: false, msg: `Erro: ${e.message}` };
    }
  }

  async detail(slug) {
    try {
      const match = slug.match(/stickers\/([a-zA-Z0-9-]+)$/);
      const id = match ? match[1] : slug;

      const res1 = await axios.get(`${this.ENDPOINT}/stickers/${id}`, { headers: this.headers }).then(r => r.data.data);
      const res2 = await axios.get(`${this.ENDPOINT}/stickers/${id}/extras`, { headers: this.headers }).then(r => r.data.data);

      const sticker = res1.images.map(item => ({
        index: item.sticker_index,
        image: `${this.STORAGE}/${item.url}`,
        animated: item.is_animated !== 0
      }));

      const related = res2.related.map(item => ({
        title: item.title,
        slug: item.slug,
        download: item.download_counter,
        user: item.user,
      }));

      const owner = res2.byOwner.map(item => ({
        title: item.title,
        slug: item.slug,
        image: `${this.STORAGE}/${item.tray_icon_large}`,
        download: item.download_counter,
        user: item.user,
      }));

      return {
        status: true,
        title: res1.title,
        downloaded: res1.download_counter,
        user: res1.user,
        updated: res1.updated_at,
        sticker,
        keywords: res2.keywords,
        related,
        owner
      };
    } catch (e) {
      return { status: false, msg: `Erro: ${e.message}` };
    }
  }
}

const sticker = new Sticker();

// --- Rotas Express ---
router.get("/search", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ status: false, msg: "Query is required" });

  const data = await sticker.search(query);
  res.status(data.status ? 200 : 500).json(data);
});

router.get("/detail", async (req, res) => {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ status: false, msg: "Slug is required" });

  const data = await sticker.detail(slug);
  res.status(data.status ? 200 : 500).json(data);
});

module.exports = router;