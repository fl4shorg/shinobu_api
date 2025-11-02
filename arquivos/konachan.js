const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

class KonachanScraper {
    constructor() {
        this.usedImages = new Set(); // evita repetições
        this.totalPages = 15000; // agora fixo em 15 mil
    }

    // Pega todos os posts de uma página
    getPage = async (page) => {
        try {
            const { data } = await axios.get(`https://konachan.net/post?page=${page}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const $ = cheerio.load(data);
            return $('ul#post-list-posts li a').map((i, el) => 'https://konachan.net' + $(el).attr('href')).get();
        } catch (err) {
            console.error(`[getPage] Erro na página ${page}: ${err.message}`);
            return [];
        }
    }

    // Pega URL original da imagem de um post
    getPic = async (href) => {
        try {
            const { data } = await axios.get(href, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const $ = cheerio.load(data);
            let url = $('#highres').attr('href') || $('#image').attr('src');
            if (!url) return null;
            if (!url.startsWith('http')) url = 'https:' + url;
            return url;
        } catch (err) {
            console.error(`[getPic] Erro no post ${href}: ${err.message}`);
            return null;
        }
    }

    // Busca uma imagem aleatória evitando repetições
    getRandomImage = async () => {
        const maxTries = 10; // evitar loop infinito
        for (let t = 0; t < maxTries; t++) {
            const randomPage = Math.floor(Math.random() * this.totalPages) + 1;
            const posts = await this.getPage(randomPage);
            if (posts.length === 0) continue;

            while (posts.length > 0) {
                const index = Math.floor(Math.random() * posts.length);
                const href = posts.splice(index, 1)[0];
                const imgUrl = await this.getPic(href);
                if (imgUrl && !this.usedImages.has(imgUrl)) {
                    this.usedImages.add(imgUrl);
                    return imgUrl;
                }
            }
        }
        return null;
    }
}

const konachan = new KonachanScraper();

// 🔥 Rota de pesquisa: retorna imagem como stream
router.get('/', async (req, res) => {
    try {
        const imageUrl = await konachan.getRandomImage();
        if (!imageUrl) return res.status(404).send('Nenhuma imagem encontrada');

        const response = await axios.get(imageUrl, { responseType: 'stream', headers: { 'User-Agent': 'Mozilla/5.0' } });
        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
    } catch (err) {
        console.error(`[API] Erro na rota /pesquisa: ${err.message}`);
        res.status(500).send(err.message);
    }
});

module.exports = router;