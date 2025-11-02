const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

// Pesquisa com link direto de download
// GET /api/dafont/search?query=termo
router.get('/search', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ status: false, message: 'Parâmetro "query" é obrigatório' });

    try {
        const base = 'https://www.dafont.com';
        const { data } = await axios.get(`${base}/search.php?q=${encodeURIComponent(query)}`);
        const $ = cheerio.load(data);

        const results = [];

        $('div.container > div').each((i, el) => {
            const preview = $(el).find('div.preview a').attr('href');
            const titulo = $(el).find('div.lv1left.dfbg').text().trim() || '';
            const estilo = $(el).find('div.lv1right.dfbg').text().trim() || '';

            if (preview) {
                const pageUrl = `${base}/${preview}`;
                results.push({ titulo, estilo, pageUrl });
            }
        });

        // Pega os links de download direto em paralelo
        const resultsWithDownload = await Promise.all(results.map(async item => {
            try {
                const { data } = await axios.get(item.pageUrl);
                const $ = cheerio.load(data);
                const download = 'http:' + $('div.dlbox > a').attr('href');
                return { ...item, download };
            } catch {
                return { ...item, download: null };
            }
        }));

        res.json({ status: 200, query, total: resultsWithDownload.length, results: resultsWithDownload });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ status: false, message: 'Erro na pesquisa DaFont', error: err.message });
    }
});

// Download manual: /api/dafont/download?link=url
router.get('/download', async (req, res) => {
    const { link } = req.query;
    if (!link) return res.status(400).json({ status: false, message: 'Parâmetro "link" é obrigatório' });

    try {
        const { data } = await axios.get(link);
        const $ = cheerio.load(data);
        const download = 'http:' + $('div.dlbox > a').attr('href');

        res.json({ status: 200, download });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ status: false, message: 'Erro ao obter link de download', error: err.message });
    }
});

module.exports = router;