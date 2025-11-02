// poohmeme.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Rota para gerar Pooh Meme usando query ?text1=&text2=
router.get('/', async (req, res) => {
    try {
        const text1 = req.query.text1;
        const text2 = req.query.text2;

        if (!text1 || !text2) {
            return res.status(400).json({ error: 'Parâmetros "text1" e "text2" são obrigatórios' });
        }

        const url = `https://api.popcat.xyz/v2/pooh?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`;

        // Busca a imagem como buffer
        const response = await axios.get(url, { responseType: 'arraybuffer' });

        // Define o tipo de conteúdo como imagem PNG e envia
        res.set('Content-Type', 'image/png');
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao gerar o Pooh Meme' });
    }
});

module.exports = router;