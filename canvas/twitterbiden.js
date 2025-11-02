// twitterbiden.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Rota para gerar a imagem do Biden usando query ?text=seutexto
router.get('/', async (req, res) => {
    try {
        const text = req.query.text;
        if (!text) return res.status(400).json({ error: 'Parâmetro "text" é obrigatório' });

        const url = `https://api.popcat.xyz/v2/biden?text=${encodeURIComponent(text)}`;

        // Busca a imagem como buffer
        const response = await axios.get(url, { responseType: 'arraybuffer' });

        // Define o tipo de conteúdo como imagem PNG e envia
        res.set('Content-Type', 'image/png');
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao gerar a imagem' });
    }
});

module.exports = router;