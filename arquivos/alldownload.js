// arquivos/alldownload.js
const express = require('express');
const axios = require('axios');
const FormData = require('form-data');

const router = express.Router();

async function aio(url) {
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
                    accept: '*/*',
                    'accept-encoding': 'gzip, deflate, br',
                    'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                    origin: 'https://ssvid.net',
                    referer: 'https://ssvid.net/en',
                    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
                    ...form.getHeaders()
                }
            }
        );

        return data;
    } catch (error) {
        throw new Error(error.message);
    }
}

// Rota GET e POST para Express
router.all('/alldownload', async (req, res) => {
    try {
        const url = req.method === 'GET' ? req.query.url : req.body.url;
        if (!url) return res.status(400).json({ success: false, message: 'Url is required' });

        const result = await aio(url);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;