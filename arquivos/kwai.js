const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

async function kwaiDownload(url) {
    if (!url) throw new Error('Url is required');

    // 1️⃣ Pegar o token automaticamente do site
    const { data: home } = await axios.get('https://allinonedownloader.pro/', {
        headers: {
            'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
        }
    });

    const $ = cheerio.load(home);
    const token = $('input[name="token"]').attr('value');
    if (!token) throw new Error('Token not found');

    // 2️⃣ Enviar a URL e o token para obter os dados do vídeo
    const { data } = await axios.post(
        'https://allinonedownloader.pro/wp-json/aio-dl/video-data/',
        new URLSearchParams({ url, token }).toString(),
        {
            headers: {
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                origin: 'https://allinonedownloader.pro',
                referer: 'https://allinonedownloader.pro/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
            }
        }
    );

    if (!data || !data.source || !data.medias) throw new Error('No video data found');

    // 3️⃣ Montar o resultado final
    const videoUrl = data.medias.find(m => m.extension === 'mp4')?.url || null;

    return {
        title: data.title || 'Sem título',
        thumbnail: data.thumbnail || '',
        videoUrl
    };
}

// Rota GET e POST
router.all('/kwai', async (req, res) => {
    try {
        const url = req.method === 'GET' ? req.query.url : req.body.url;
        if (!url) return res.status(400).json({ success: false, message: 'Url is required' });

        const result = await kwaiDownload(url);

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;