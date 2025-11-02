const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

class YandereScraper {
    constructor() {
        this.usedImages = new Set(); // Evita repetições
        this.totalPages = 1; // Será atualizado
    }

    async discoverTotalPages() {
        try {
            const { data } = await axios.get('https://yande.re/post', { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const $ = cheerio.load(data);
            const lastPageHref = $('.pagination .last_page').attr('href');
            if (lastPageHref) {
                const match = lastPageHref.match(/page=(\d+)/);
                if (match) this.totalPages = parseInt(match[1]);
            }
        } catch (err) {
            console.error(`[discoverTotalPages] Erro: ${err.message}`);
        }
    }

    getPage = async (page) => {
        try {
            const { data } = await axios.get(`https://yande.re/post?page=${page}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const $ = cheerio.load(data);
            return $('#post-list-posts li .thumb').map((i, el) => 'https://yande.re/' + $(el).attr('href')).get();
        } catch (err) {
            console.error(`[getPage] Erro na página ${page}: ${err.message}`);
            return [];
        }
    }

    getPic = async (href) => {
        try {
            const { data } = await axios.get(href, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const $ = cheerio.load(data);
            const url = $('.original-file-changed').attr('href') || $('.original-file-unchanged').attr('href');
            if (!url) return null;
            return url;
        } catch (err) {
            console.error(`[getPic] Erro no post ${href}: ${err.message}`);
            return null;
        }
    }

    getRandomImage = async () => {
        await this.discoverTotalPages();
        const randomPage = Math.floor(Math.random() * this.totalPages) + 1;
        const posts = await this.getPage(randomPage);
        if (posts.length === 0) return null;

        let imageUrl = null;
        while (posts.length > 0 && !imageUrl) {
            const index = Math.floor(Math.random() * posts.length);
            const href = posts.splice(index, 1)[0];
            const imgUrl = await this.getPic(href);
            if (imgUrl && !this.usedImages.has(imgUrl)) {
                imageUrl = imgUrl;
                this.usedImages.add(imgUrl);
                return imageUrl;
            }
        }

        return null;
    }
}

const yandere = new YandereScraper();

// 🔥 Rota de pesquisa: retorna imagem como stream
router.get('/', async (req, res) => {
    try {
        const imageUrl = await yandere.getRandomImage();
        if (!imageUrl) return res.status(404).send('Nenhuma imagem encontrada');

        const response = await axios.get(imageUrl, { responseType: 'stream', headers: { 'User-Agent': 'Mozilla/5.0' } });
        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
    } catch (err) {
        console.error(`[API] Erro na rota /: ${err.message}`);
        res.status(500).send(err.message);
    }
});

module.exports = router;