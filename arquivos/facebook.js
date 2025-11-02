const express = require('express');
const { getFbVideoInfo } = require('fb-downloader-scrapper');

const router = express.Router();

// Rota GET para /download?url=...
router.get('/', async (req, res) => {
    try {
        const url = req.query.url;
        if (!url) return res.status(400).json({ error: 'Informe ?url=' });

        const result = await getFbVideoInfo(url);

        res.json({
            apiBy: 'Neext',
            facebookUrl: url,
            result
        });
    } catch (err) {
        console.error('[facebook.js]', err.message);
        res.status(500).json({
            error: 'Erro ao baixar o vídeo do Facebook.',
            details: err.message
        });
    }
});

module.exports = router;