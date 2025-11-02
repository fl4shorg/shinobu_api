// arquivos/tumblr.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

// Função para buscar imagens do Tumblr
async function searchTumblr(query) {
    try {
        const url = `https://www.tumblr.com/search/${encodeURIComponent(query)}?src=typed_query`;
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        });

        const $ = cheerio.load(data);
        const images = [];

        $('img').each((i, el) => {
            const src = $(el).attr('src');
            if (src && src.startsWith('https://64.media.tumblr.com/')) {
                images.push(src);
            }
        });

        return images;
    } catch (err) {
        console.error(err);
        return [];
    }
}

// Rota GET/POST
router.all('/tumblr', async (req, res) => {
    try {
        const query = req.method === 'GET' ? req.query.q : req.body.q;
        if (!query) return res.status(400).json({ success: false, message: 'Query is required' });

        const results = await searchTumblr(query);
        res.json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;