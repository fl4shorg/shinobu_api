const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

class AuntMiaScraper {
    constructor() {
        this.usedImages = new Set();
        this.pageUrl = 'https://www.auntmia.com/';
    }

    getRandomImage = async () => {
        try {
            const { data } = await axios.get(this.pageUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'Referer': 'https://www.auntmia.com/'
                }
            });

            const $ = cheerio.load(data);

            // Seleciona todas as imagens com data-src ou src
            const imgs = $('img.lazyloaded, img').map((i, el) => {
                return $(el).attr('data-src') || $(el).attr('src');
            }).get()
              .filter(Boolean)
              .filter(url => !this.usedImages.has(url));

            if (!imgs.length) return null;

            const index = Math.floor(Math.random() * imgs.length);
            const imgUrl = imgs[index];
            this.usedImages.add(imgUrl);

            return imgUrl.startsWith('http') ? imgUrl : 'https://www.auntmia.com' + imgUrl;

        } catch (err) {
            console.error(`[getRandomImage] Erro: ${err.message}`);
            return null;
        }
    }
}

// Instancia do scraper
const scraper = new AuntMiaScraper();

// 🔥 App.use simples retornando a imagem como stream
router.use(async (req, res) => {
    try {
        const imgUrl = await scraper.getRandomImage();
        if (!imgUrl) return res.status(404).send('Nenhuma imagem encontrada');

        const response = await axios.get(imgUrl, {
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Referer': 'https://www.auntmia.com/'
            }
        });

        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);

    } catch (err) {
        console.error(`[API] Erro na rota /api/photoporno: ${err.message}`);
        res.status(500).send(err.message);
    }
});

module.exports = router;