// arquivos/kwai.js
const express = require('express');
const axios = require('axios');
const FormData = require('form-data');

const router = express.Router();

async function kwaiDownload(url) {
    try {
        if (!url) throw new Error('Url is required');

        const form = new FormData();
        form.append('query', url);
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

        // ⚠️ Algumas respostas vêm em data.data
        const result = data.data || data;

        if (result.links && result.links.video && result.links.video.mp4) {
            const videoUrl = result.links.video.mp4.url;
            const title = result.title || '';
            const thumbnail = result.thumbnail || '';
            return { title, thumbnail, videoUrl };
        } else {
            throw new Error('No video link found');
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

// Rota GET e POST
router.all('/kwai', async (req, res) => {
    try {
        const url = req.method === 'GET' ? req.query.url : req.body.url;
        if (!url) return res.status(400).json({ success: false, message: 'Url is required' });

        const result = await kwaiDownload(url);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;