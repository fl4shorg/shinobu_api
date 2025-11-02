const express = require('express');
const axios = require('axios');
const router = express.Router();

// Rota: /api/proxy
router.get('/', async (req, res) => {
    try {
        const apiUrl = 'https://proxylist.geonode.com/api/proxy-list?limit=500&page=1&sort_by=lastChecked&sort_type=desc';
        const { data } = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'application/json'
            },
            timeout: 15000
        });

        // Retorna os dados recebidos da API Geonode
        res.status(200).json({
            statusCode: 200,
            total: data.total || 0,
            proxies: data.data || []
        });

    } catch (error) {
        console.error('Erro ao consultar API de proxy:', error.message);
        const msg = error.response?.data || error.message;
        res.status(500).json({ status: false, message: msg });
    }
});

module.exports = router;