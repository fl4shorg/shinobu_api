const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

class GenshinWallpaper {
    constructor() {
        this.usedImages = new Set();
        this.baseUrl = 'https://wallpaperaccess.com';
        this.pageUrl = `${this.baseUrl}/genshin-impact-4k`;
    }

    // coleta todas as imagens válidas da página
    getImages = async () => {
        try {
            const { data } = await axios.get(this.pageUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });

            const $ = cheerio.load(data);
            const images = [];

            $('div.wrapper img').each((i, el) => {
                let imgUrl = $(el).attr('data-src') || $(el).attr('src');
                if (imgUrl && imgUrl.startsWith('/full/')) {
                    imgUrl = this.baseUrl + imgUrl;
                    if (!this.usedImages.has(imgUrl)) {
                        images.push(imgUrl);
                    }
                }
            });

            return images;
        } catch (err) {
            console.error(`[getImages] Erro: ${err.message}`);
            return [];
        }
    }

    // retorna uma imagem aleatória
    getRandomImage = async () => {
        const images = await this.getImages();
        if (!images.length) return null;

        const index = Math.floor(Math.random() * images.length);
        const imgUrl = images[index];
        this.usedImages.add(imgUrl);

        return imgUrl;
    }
}

const genshin = new GenshinWallpaper();

// rota simples com stream
router.use(async (req, res) => {
    try {
        const imgUrl = await genshin.getRandomImage();
        if (!imgUrl) return res.status(404).send('Nenhuma imagem encontrada');

        const response = await axios.get(imgUrl, {
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
    } catch (err) {
        console.error(`[API] Erro em /api/wallpapergenshin: ${err.message}`);
        res.status(500).send(err.message);
    }
});

module.exports = router;