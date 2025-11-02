// arquivos/mediafire.js
// • MediaFire Search API • Desenvolvido por Neext •

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

async function mfsearch(query) {
    try {
        if (!query) throw new Error('Query is required');
        
        const { data: html } = await axios.get(`https://mediafiretrend.com/?q=${encodeURIComponent(query)}&search=Search`);
        const $ = cheerio.load(html);
        
        const links = shuffle(
            $('tbody tr a[href*="/f/"]').map((_, el) => $(el).attr('href')).get()
        ).slice(0, 5);
        
        const result = await Promise.all(links.map(async link => {
            const { data } = await axios.get(`https://mediafiretrend.com${link}`);
            const $ = cheerio.load(data);
            
            const raw = $('div.info tbody tr:nth-child(4) td:nth-child(2) script').text();
            const match = raw.match(/unescape\(['"`]([^'"`]+)['"`]\)/);
            const decoded = cheerio.load(decodeURIComponent(match[1]));
            
            return {
                filename: $('tr:nth-child(2) td:nth-child(2) b').text().trim(),
                filesize: $('tr:nth-child(3) td:nth-child(2)').text().trim(),
                url: decoded('a').attr('href'),
                source_url: $('tr:nth-child(5) td:nth-child(2)').text().trim(),
                source_title: $('tr:nth-child(6) td:nth-child(2)').text().trim()
            };
        }));
        
        return result;
    } catch (err) {
        throw new Error(err.message);
    }
}

// === Rota da API ===
router.get("/", async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ error: "Parâmetro 'q' é obrigatório." });

        const data = await mfsearch(q);
        res.json({
            query: q,
            resultados: data,
            total: data.length,
            desenvolvido_por: "Neext"
        });
    } catch (error) {
        res.status(500).json({
            error: "Erro ao buscar arquivos no MediaFire.",
            detalhes: error.message,
            desenvolvido_por: "Neext"
        });
    }
});

module.exports = router;