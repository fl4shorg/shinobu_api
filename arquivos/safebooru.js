const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

class SafebooruScraper {
    constructor() {
        this.usedImages = new Set();
        this.pageUrl = 'https://safebooru.org/index.php?page=post&s=list&tags=&pid=0';
    }

    getRandomImage = async () => {
        try {
            const { data } = await axios.get(this.pageUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'Referer': 'https://safebooru.org/',
                }
            });

            const $ = cheerio.load(data);
            const imgs = $('span.thumb img')
                .map((i, el) => $(el).attr('src'))
                .get()
                .filter(Boolean)
                .filter(url => !this.usedImages.has(url));

            if (!imgs.length) return null;

            const index = Math.floor(Math.random() * imgs.length);
            const imgUrl = imgs[index];
            this.usedImages.add(imgUrl);

            const fullUrl = imgUrl.startsWith('http') ? imgUrl : 'https://safebooru.org' + imgUrl;
            return fullUrl;

        } catch (err) {
            console.error(`[getRandomImage] Erro: ${err.message}`);
            return null;
        }
    }
}

const scraper = new SafebooruScraper();

// 🔥 App.use simples retornando a imagem como stream
router.use(async (req, res) => {
    try {
        const imgUrl = await scraper.getRandomImage();
        if (!imgUrl) return res.status(404).send('Nenhuma imagem encontrada');

        const response = await axios.get(imgUrl, {
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Referer': 'https://safebooru.org/'
            }
        });

        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);

    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;