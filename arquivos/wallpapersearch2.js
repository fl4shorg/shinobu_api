const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

class WallpaperSearch2 {
    constructor() {
        this.usedImages = new Set(); // evita imagens repetidas
    }

    // busca imagens da página
    search = async (title, page = 1) => {
        try {
            const url = `https://pt.wallpapers.com/search/${encodeURIComponent(title)}?page=${page}`;
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'Referer': 'https://pt.wallpapers.com/'
                }
            });

            const $ = cheerio.load(data);
            const images = [];

            $('a picture img').each((i, el) => {
                const img = $(el).attr('data-src') || $(el).attr('src');
                if (img && !this.usedImages.has(img)) {
                    images.push(img.startsWith('http') ? img : 'https://pt.wallpapers.com' + img);
                }
            });

            return images;

        } catch (err) {
            console.error(`[search] Erro: ${err.message}`);
            return [];
        }
    }

    // pega imagem aleatória
    getRandom = async (title) => {
        const images = await this.search(title);
        if (!images.length) return null;

        const index = Math.floor(Math.random() * images.length);
        const imgUrl = images[index];
        this.usedImages.add(imgUrl);

        return imgUrl;
    }
}

const wallpaper2 = new WallpaperSearch2();

// app.use simples
router.use(async (req, res) => {
    const title = req.query.q || 'free-fire'; // pesquisa padrão

    try {
        const imgUrl = await wallpaper2.getRandom(title);
        if (!imgUrl) return res.status(404).send('Nenhuma imagem encontrada');

        const response = await axios.get(imgUrl, {
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Referer': 'https://pt.wallpapers.com/'
            }
        });

        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);

    } catch (err) {
        console.error(`[API] Erro na rota /api/wallpapersearch2: ${err.message}`);
        res.status(500).send(err.message);
    }
});

module.exports = router;