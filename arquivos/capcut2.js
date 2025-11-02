const express = require('express');
const axios = require('axios');
const router = express.Router();

// Função para extrair dados do CapCut
async function wakata(url) {
    try {
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.2 Mobile/15E148 Safari/604.1'
            }
        });

        const html = res.data;
        const match = html.match(/"structuredData":({.*?}),"bizCode"/);
        if (!match) return { error: 'structuredData not found' };

        const data = JSON.parse(match[1]);

        const decodeUrl = (str) => str.replace(/\\u002F/g, '/').replace(/^https:\\/, 'https://');

        return {
            title: data.name || '',
            description: data.description || '',
            thumbnail: decodeUrl(data.thumbnailUrl || ''),
            video: decodeUrl(data.contentUrl || ''),
            author: data.creator?.name || '',
            avatar: decodeUrl(data.creator?.avatarUrl || ''),
            duration: data.duration || 0,
            likes: data.interactionStatistic?.likeCount || 0,
            uses: data.interactionStatistic?.useCount || 0
        };

    } catch (e) {
        return { error: e.message };
    }
}

// Rota: /api/capcut?url=...
router.get('/', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'Parâmetro "url" é obrigatório' });

    try {
        const result = await wakata(url);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;