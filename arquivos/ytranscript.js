const express = require('express');
const axios = require('axios');
const router = express.Router();

// Rota: /api/ytranscript?url=LINK_YOUTUBE
router.get('/', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'Parâmetro "url" é obrigatório' });

    try {
        const apiUrl = `https://api.zenzxz.my.id/api/tools/ytranscript?url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        // Pega o resultado da API
        let resultData = data.result || data;

        // Remove o campo 'creator' se existir
        if (resultData.creator) delete resultData.creator;

        res.status(200).json({
            statusCode: 200,
            result: resultData
        });

    } catch (error) {
        console.error('Erro ao consultar API YTranscript:', error.message);
        const msg = error.response?.data || error.message;
        res.status(500).json({ status: false, message: msg });
    }
});

module.exports = router;