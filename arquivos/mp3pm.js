// arquivos/mp3pm.js
// • MP3.pm Scraper API • Desenvolvido por Neext •

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

// Cabeçalhos padrão
const headers = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:108.0) Gecko/20100101 Firefox/108.0",
};

// Função genérica para parsear resultados HTML
function parseResults(html) {
    const $ = cheerio.load(html);
    const results = [];

    $(".cplayer-sound-item").each((i, el) => {
        const $el = $(el);
        results.push({
            soundId: $el.attr("data-sound-id"),
            title: $el.find(".cplayer-data-sound-title").text().trim(),
            author: $el.find(".cplayer-data-sound-author").text().trim(),
            duration: $el.find(".cplayer-data-sound-time").text().trim(),
            shareUrl: $el.attr("data-share-url"),
            downloadUrl: $el.attr("data-sound-url"),
        });
    });

    return results;
}

// Buscar música
router.get("/search", async (req, res) => {
    const q = req.query.q;
    if (!q) return res.json({ success: false, message: "Parâmetro 'q' obrigatório." });

    try {
        const apiUrl = "https://mp3.pm/public/api.search.php";
        const searchReq = await axios.post(
            apiUrl,
            new URLSearchParams({ q }).toString(),
            {
                headers: {
                    ...headers,
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                },
            }
        );

        const slugUrl = searchReq.data;
        if (typeof slugUrl !== "string")
            return res.json({ success: false, message: "Resposta inesperada da API." });

        const page = await axios.get(slugUrl, { headers });
        const results = parseResults(page.data);

        if (!results.length)
            return res.json({ success: false, message: "Nenhum resultado encontrado." });

        res.json({ success: true, results });
    } catch (err) {
        res.json({
            success: false,
            message: "Erro ao buscar música.",
            detalhes: err.message,
        });
    }
});

// Populares
router.get("/popular", async (req, res) => {
    try {
        const { data } = await axios.get("https://mp3.pm/", { headers });
        res.json({ success: true, results: parseResults(data) });
    } catch (err) {
        res.json({ success: false, message: "Erro ao buscar populares.", detalhes: err.message });
    }
});

// Rádio
router.get("/radio", async (req, res) => {
    try {
        const { data } = await axios.get("https://mp3.pm/radio/pop/", { headers });
        res.json({ success: true, results: parseResults(data) });
    } catch (err) {
        res.json({ success: false, message: "Erro ao buscar rádio.", detalhes: err.message });
    }
});

// Rock
router.get("/rock", async (req, res) => {
    try {
        const { data } = await axios.get("https://mp3.pm/top/rock/", { headers });
        res.json({ success: true, results: parseResults(data) });
    } catch (err) {
        res.json({ success: false, message: "Erro ao buscar rock.", detalhes: err.message });
    }
});

// Instrumental
router.get("/instrumental", async (req, res) => {
    try {
        const { data } = await axios.get("https://mp3.pm/top/instrumental/", { headers });
        res.json({ success: true, results: parseResults(data) });
    } catch (err) {
        res.json({ success: false, message: "Erro ao buscar instrumental.", detalhes: err.message });
    }
});

module.exports = router;