const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const translateModule = require('@vitalets/google-translate-api'); // CommonJS
const translate = translateModule.default || translateModule;

const router = express.Router();

// Rota: /api/bingsearch?query=termo
router.get('/', async (req, res) => {
    const { query } = req.query;

    if (!query) return res.status(400).json({ status: false, message: 'Parâmetro "query" é obrigatório' });

    try {
        const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
        });

        const $ = cheerio.load(data);
        const results = [];

        $('li.b_algo').each((i, el) => {
            const title = $(el).find('h2').text().trim();
            const link = $(el).find('h2 a').attr('href');
            const description = $(el).find('p').text().trim();

            if (title && link) {
                results.push({ title, link, description });
            }
        });

        if (!results.length) {
            return res.status(404).json({ status: false, message: 'Nenhum resultado encontrado' });
        }

        // Traduzir título e descrição em paralelo
        await Promise.all(results.map(async (item) => {
            try {
                const [translatedTitle, translatedDescription] = await Promise.all([
                    translate(item.title, { to: 'pt' }),
                    translate(item.description || '', { to: 'pt' })
                ]);
                item.title = translatedTitle.text;
                item.description = translatedDescription.text;
            } catch (err) {
                console.error('Erro ao traduzir:', err.message);
            }
        }));

        res.json({
            status: 200,
            query,
            total: results.length,
            results
        });
    } catch (err) {
        console.error('Erro ao buscar no Bing:', err.message);
        res.status(500).json({ status: false, message: 'Erro ao buscar no Bing', error: err.message });
    }
});

module.exports = router;