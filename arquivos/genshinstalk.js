const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

// Rota: /api/genshinstalk/:id
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ status: false, message: 'ID é obrigatório' });

    try {
        const url = `https://genshin-builds.com/pt/profile/${id}`;
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        const $ = cheerio.load(data);

        // Pega o nickname
        const nickname = $('h2.text-xl.font-semibold.text-white.md\\:text-4xl').first().text().trim();

        // Pega o avatar
        const avatar = $('img[alt$="Avatar"]').first().attr('src');

        // Pega o level do jogador
        const level = $('div[title="Level"]').first().text().trim();

        if (!nickname) {
            return res.status(404).json({ status: false, message: 'Perfil não encontrado' });
        }

        res.json({
            status: 200,
            id,
            nickname,
            avatar,
            level
        });
    } catch (err) {
        console.error('Erro ao buscar perfil Genshin:', err.message);
        res.status(500).json({ status: false, message: 'Erro ao buscar perfil', error: err.message });
    }
});

module.exports = router;