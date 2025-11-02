const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

class EShuushuuScraper {
    constructor() {
        this.usedImages = new Set();
        this.pageUrl = 'https://e-shuushuu.net/top.php';
    }

    getRandomImage = async () => {
        try {
            const { data } = await axios.get(this.pageUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'Referer': 'https://e-shuushuu.net/'
                }
            });

            const $ = cheerio.load(data);

            // Seleciona todas as imagens dentro de div.thumb
            const imgs = $('div.thumb img')
                .map((i, el) => $(el).attr('src'))
                .get()
                .filter(Boolean)
                .filter(url => !this.usedImages.has(url));

            if (!imgs.length) return null;

            const index = Math.floor(Math.random() * imgs.length);
            const imgUrl = imgs[index];
            this.usedImages.add(imgUrl);

            // Corrige URLs relativas
            const fullUrl = imgUrl.startsWith('http') ? imgUrl : 'https://e-shuushuu.net' + imgUrl;
            return fullUrl;

        } catch (err) {
            console.error(`[getRandomImage] Erro: ${err.message}`);
            return null;
        }
    }
}

const scraper = new EShuushuuScraper();

// 🔥 App.use simples retornando a imagem como stream
router.use(async (req, res) => {
    try {
        const imgUrl = await scraper.getRandomImage();
        if (!imgUrl) return res.status(404).send('Nenhuma imagem encontrada');

        const response = await axios.get(imgUrl, {
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Referer': 'https://e-shuushuu.net/'
            }
        });

        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);

    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;