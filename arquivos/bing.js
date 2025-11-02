const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

// Rota: /api/bing?query=termo
router.get('/', async (req, res) => {
    const { query } = req.query;

    if (!query) return res.status(400).json({ status: false, message: 'Parâmetro "query" é obrigatório' });

    try {
        const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&first=1`;
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
        });

        const $ = cheerio.load(data);
        const results = [];

        $('a.iusc').each((i, el) => {
            const m = $(el).attr('m');
            if (!m) return;
            try {
                const meta = JSON.parse(m);
                if (meta.murl) results.push(meta.murl); // URL da imagem
            } catch (e) {
                // Ignora erros de parse
            }
        });

        if (!results.length) {
            return res.status(404).json({ status: false, message: 'Nenhuma imagem encontrada' });
        }

        res.json({
            status: 200,
            query,
            total: results.length,
            results
        });
    } catch (err) {
        console.error('Erro ao buscar imagens no Bing:', err.message);
        res.status(500).json({ status: false, message: 'Erro ao buscar imagens', error: err.message });
    }
});

module.exports = router;