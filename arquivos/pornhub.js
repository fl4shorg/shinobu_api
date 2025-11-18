const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

/**
 * ===============================
 *  FUNÇÃO — DOWNLOAD POR URL
 * ===============================
 */
async function getPornhubVideo(pageUrl) {
  try {
    if (!pageUrl) throw new Error("URL não fornecida");

    const { data: html } = await axios.get(pageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Mobile Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      responseType: "text",
      timeout: 20000,
    });

    const title = html.match(/<title>(.*?)<\/title>/)?.[1]
      ?.replace(" - Pornhub.com", "")
      ?.trim() || null;

    const thumb =
      html.match(/"image_url":"(.*?)"/)?.[1]?.replace(/\\\//g, "/") ||
      html.match(/"image":"(.*?)"/)?.[1]?.replace(/\\\//g, "/") ||
      null;

    let duration =
      html.match(/"video_duration":"(.*?)"/)?.[1] ||
      html.match(/"duration":"(.*?)"/)?.[1] ||
      html.match(/<span class="duration">(.*?)<\/span>/)?.[1] ||
      html.match(/<var class="duration">(.*?)<\/var>/)?.[1] ||
      null;
    if (duration) duration = duration.trim();

    const uploader =
      html.match(/"owner":"(.*?)"/)?.[1] ||
      html.match(/"username":"(.*?)"/)?.[1] ||
      html.match(/"video_uploader":"(.*?)"/)?.[1] ||
      null;

    let views =
      html.match(/"views":"([\d,\.]+)"/)?.[1] ||
      html.match(/"view_count":"([\d,\.]+)"/)?.[1] ||
      html.match(/<span class="views">([\d,\.]+) views<\/span>/)?.[1] ||
      html.match(/<var class="views">([\d,\.]+)<\/var>/)?.[1] ||
      null;
    if (views) views = views.replace(/[,.]/g, "").trim();

    const mediaBlockMatch =
      html.match(/mediaDefinitions\s*:\s*(\[[\s\S]*?\])/) ||
      html.match(/"mediaDefinitions"\s*:\s*(\[[\s\S]*?\])/) ||
      html.match(/mediaDefinitions":\s*(\[[\s\S]*?\])/);

    if (!mediaBlockMatch) {
      return { error: "mediaDefinitions não encontrado", desenvolvido_por: "Neext" };
    }

    const mediaBlockRaw = mediaBlockMatch[1];
    let items = [];

    try {
      const parsed = JSON.parse(mediaBlockRaw);
      if (Array.isArray(parsed)) {
        items = parsed
          .map((it) => ({
            quality: it.quality || null,
            rawUrl: it.videoUrl || it.mediaUrl || null,
          }))
          .filter((x) => x.rawUrl);
      }
    } catch (e) {
      const objectMatches = mediaBlockRaw.match(/\{[^}]*\}/g) || [];
      items = objectMatches
        .map((objText) => {
          const urlMatch =
            objText.match(/"videoUrl"\s*:\s*"([^"]+)"/) ||
            objText.match(/videoUrl"\s*:\s*"([^"]+)"/);

          const qualityMatch =
            objText.match(/"quality"\s*:\s*"([^"]+)"/) ||
            objText.match(/quality"\s*:\s*"([^"]+)"/);

          return { quality: qualityMatch ? qualityMatch[1] : null, rawUrl: urlMatch ? urlMatch[1] : null };
        })
        .filter((x) => x.rawUrl);
    }

    if (!items.length) {
      return { error: "Nenhuma url encontrada em mediaDefinitions", desenvolvido_por: "Neext" };
    }

    const urls = items
      .map((it) => {
        let u = it.rawUrl || "";
        u = u.replace(/\\\//g, "/").replace(/\\+/g, "").trim();
        const type = u.includes(".m3u8") ? "HLS" : u.includes(".mp4") ? "MP4" : "OTHER";
        return { quality: it.quality || null, url: u, type };
      })
      .sort((a, b) => (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0));

    return {
      video: { title, uploader, thumb, duration, views, urls },
      desenvolvido_por: "Neext",
    };
  } catch (err) {
    return { error: "Falha ao processar página", desenvolvido_por: "Neext" };
  }
}

/**
 * ===============================
 * ROTA DOWNLOAD — GET /download
 * ===============================
 */
router.get("/download", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Parâmetro 'url' não fornecido", desenvolvido_por: "Neext" });

  const result = await getPornhubVideo(url);
  return res.json(result);
});

/**
 * ===============================
 * FUNÇÃO SEARCH COMPLETA
 * ===============================
 */
async function pornhubSearch(q) {
  const { data } = await axios.get(`https://pt.pornhub.com/video/search?search=${encodeURIComponent(q)}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  const $ = cheerio.load(data);
  const results = [];

  $("li.pcVideoListItem.js-pop.videoblock.videoBox").each((_, el) => {
    const title = $(el).find("a").attr("title") || null;
    const link = $(el).find("a").attr("href") ? `https://pt.pornhub.com${$(el).find("a").attr("href")}` : null;
    const img = $(el).find("img").attr("data-src") || $(el).find("img").attr("src") || null;
    const duration = $(el).find("var.duration").text().trim() || null;
    const quality = $(el).find("span.hd-thumbnail").text().trim() || null;
    const author = $(el).find("div.usernameWrap").text().trim() || null;
    const views = $(el).find("span.views").text().trim() || null;
    const uploadDate = $(el).find("var.added").text().trim() || null;

    if (title && link) {
      results.push({
        title,
        link,
        img,
        duration,
        quality,
        author,
        views,
        uploadDate,
      });
    }
  });

  return results;
}

/**
 * ===============================
 * ROTA SEARCH — GET /search
 * ===============================
 */
router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Parâmetro 'q' não fornecido", desenvolvido_por: "Neext" });

  try {
    const results = await pornhubSearch(q);
    return res.json({ query: q, total: results.length, results, desenvolvido_por: "Neext" });
  } catch (err) {
    return res.json({ error: "Falha ao buscar vídeos", desenvolvido_por: "Neext" });
  }
});

/**
 * ===============================
 * ROTA SEARCH FIRST — GET /search/first
 * ===============================
 */
router.get("/search/first", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Parâmetro 'q' não fornecido", desenvolvido_por: "Neext" });

  try {
    const results = await pornhubSearch(q);
    if (!results.length) return res.json({ error: "Nenhum vídeo encontrado", desenvolvido_por: "Neext" });

    return res.json({ query: q, result: results[0], desenvolvido_por: "Neext" });
  } catch (err) {
    return res.json({ error: "Falha ao buscar primeiro resultado", desenvolvido_por: "Neext" });
  }
});

module.exports = router;