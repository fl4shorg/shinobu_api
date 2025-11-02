// arquivos/reddit.js
const express = require('express');
const axios = require('axios');
const FormData = require('form-data');

const router = express.Router();

// Função para limpar a URL do Reddit
function cleanRedditUrl(url) {
    const match = url.match(/(https:\/\/www\.reddit\.com\/r\/[^\/]+\/comments\/[^\/]+\/_\/?)/);
    return match ? match[1] : url;
}

async function redditDownload(url) {
    try {
        if (!url) throw new Error('Url is required');

        const cleanedUrl = cleanRedditUrl(url);

        const form = new FormData();
        form.append('query', cleanedUrl);
        form.append('vt', 'home');

        const { data } = await axios.post(
            'https://ssvid.net/api/ajax/search?hl=en',
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                    'Referer': 'https://ssvid.net/en',
                    'Origin': 'https://ssvid.net',
                    'Accept': '*/*',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            }
        );

        const result = data.data || data;

        if (!result.links || !result.links.video) {
            throw new Error('No video links found');
        }

        // Retorna todos os vídeos disponíveis
        const videos = {};
        for (const key in result.links.video) {
            const videoObj = result.links.video[key];
            if (videoObj.url) {
                videos[key] = videoObj.url;
            }
        }

        return {
            title: result.title || '',
            thumbnail: result.thumbnail || '',
            videos
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

// Rota GET e POST
router.all('/reddit', async (req, res) => {
    try {
        const url = req.method === 'GET' ? req.query.url : req.body.url;
        if (!url) return res.status(400).json({ success: false, message: 'Url is required' });

        const result = await redditDownload(url);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;