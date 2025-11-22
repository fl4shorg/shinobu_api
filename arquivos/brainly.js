const express = require("express");
const axios = require("axios");

const router = express.Router();

async function brainlySearch(query) {
  try {
    const url = `https://brainly.com/bff/social-qa/answer-experience-web/api/v1/search?query=${encodeURIComponent(query)}&limit=5&market=id`;
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://brainly.com/",
        "Origin": "https://brainly.com"
      },
      timeout: 5000, // 5 segundos de timeout
    });

    if (!res.data?.data?.results || res.data.data.results.length === 0) {
      return {
        success: true,
        status: 200,
        total: 0,
        query: query,
        results: [],
      };
    }

    const results = res.data.data.results.map((item) => {
      const q = item.question;
      const ans = q.answer;

      return {
        id: q.id,
        question: q.content?.replace(/<[^>]+>/g, "").trim(),
        answer: ans?.content?.replace(/<[^>]+>/g, "").trim(),
        subject: q.subject?.name || "Unknown",
        grade: q.grade?.name || "Unknown",
        author: ans?.author?.nick || "Anonim",
        avatar: ans?.author?.avatarUrl || null,
        attachments: q.attachments?.map((a) => a.url) || [],
      };
    });

    return {
      success: true,
      status: 200,
      total: results.length,
      query: query,
      results,
    };
  } catch (err) {
    console.error(err.message);
    return {
      success: false,
      status: 500,
      message: "Erro ao buscar dados no Brainly. Verifique a query ou tente novamente.",
    };
  }
}

// Rota GET /brainly?query=...
router.get("/", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ success: false, message: "Query is required" });

  const data = await brainlySearch(query);
  res.status(data.status).json(data);
});

module.exports = router;