// arquivos/kwai.js
const express = require('express');
const axios = require('axios');
const qs = require('querystring');

const router = express.Router();

async function kwaiDownload(url) {
    if (!url) throw new Error('Url is required');

    // 1️⃣ Pega a URL ofuscada via onedownloader
    const { data } = await axios.post(
        'https://onedownloader.net/search',
        qs.stringify({ query: url }),
        {
            headers: {
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                origin: 'https://onedownloader.net',
                referer: 'https://onedownloader.net/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36',
                'x-requested-with': 'XMLHttpRequest'
            }
        }
    );

    const result = data.data;
    if (!result || !result.links || !result.links.video) throw new Error('No video found');

    const videoPartial = result.links.video.mp4?.url || result.links.video['720x1280']?.url;
    if (!videoPartial) throw new Error('No MP4 link found');

    // 2️⃣ Monta o link completo
    const videoUrl = videoPartial.startsWith('http')
        ? videoPartial
        : `https://dl1.dmate8.online/?file=${videoPartial}`;

    return {
        title: result.title || '',
        thumbnail: result.thumbnail || '',
        videoUrl
    };
}

// Rota GET e POST
router.all('/kwai', async (req, res) => {
    try {
        const url = req.method === 'GET' ? req.query.url : req.body.url;
        if (!url) return res.status(400).json({ success: false, message: 'Url is required' });

        const result = await kwaiDownload(url);

        // Retorna o JSON com link direto
        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;