const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

class WallpaperSearch {
    constructor() {
        this.usedImages = new Set(); // evita repetição
    }

    search = async (title, page = 1) => {
        try {
            const { data } = await axios.get(`https://www.besthdwallpaper.com/search?CurrentPage=${page}&q=${encodeURIComponent(title)}`);
            const $ = cheerio.load(data);
            const results = [];

            $('div.grid-item').each((i, el) => {
                const img = $(el).find('picture > img').attr('data-src') || $(el).find('picture > img').attr('src');
                if (img && !this.usedImages.has(img)) {
                    results.push(img.startsWith('http') ? img : 'https://www.besthdwallpaper.com' + img);
                }
            });

            return results;
        } catch (err) {
            console.error(`[search] Erro: ${err.message}`);
            return [];
        }
    }

    getRandom = async (title) => {
        const images = await this.search(title);
        if (!images.length) return null;

        const index = Math.floor(Math.random() * images.length);
        const imgUrl = images[index];
        this.usedImages.add(imgUrl);

        return imgUrl;
    }
}

const wallpaper = new WallpaperSearch();

// 🔥 App.use simples retornando a imagem
router.use(async (req, res) => {
    const title = req.query.q || 'nature'; // pesquisa padrão
    try {
        const imgUrl = await wallpaper.getRandom(title);
        if (!imgUrl) return res.status(404).send('Nenhuma imagem encontrada');

        const response = await axios.get(imgUrl, {
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);

    } catch (err) {
        console.error(`[API] Erro na rota /api/wallpapersearch: ${err.message}`);
        res.status(500).send(err.message);
    }
});

module.exports = router;