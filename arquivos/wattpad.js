const express = require('express');
const axios = require('axios');
const translate = require('@vitalets/google-translate-api');
const router = express.Router();

// Função de pesquisa Wattpad com tradução e limpeza da descrição
async function wattpad(query) {
    try {
        const { data } = await axios.get(`https://www.wattpad.com/api/v3/stories?query=${encodeURIComponent(query)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        if (!data.stories || data.stories.length === 0) return [];

        const results = await Promise.all(data.stories.map(async story => {
            let description = story.description || '';
            // Limpa quebras de linha e espaços extras
            description = description.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

            // Traduz a descrição
            try {
                const traduzido = await translate(description, { to: 'pt' });
                description = traduzido.text;
            } catch (err) {
                console.error('Erro ao traduzir descrição:', err.message);
            }

            return {
                titulo: story.title,
                link: `https://www.wattpad.com/story/${story.id}`,
                imagem: story.cover,
                description
            };
        }));

        return results;

    } catch (error) {
        console.error(error);
        throw new Error('Erro ao buscar histórias Wattpad');
    }
}

// Função de usuário Wattpad
async function wattpadUser(username) {
    try {
        const { data } = await axios.get(`https://www.wattpad.com/api/v3/users/${encodeURIComponent(username)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        return {
            status: 200,
            username: data.username,
            name: data.name,
            bio: data.bio,
            followers: data.followers_count,
            following: data.following_count,
            stories: data.story_count,
            avatar: data.avatar_url
        };

    } catch (error) {
        console.error(error);
        throw new Error('Usuário não encontrado ou erro na API Wattpad');
    }
}

// Rota de pesquisa de histórias: /api/wattpad?q=termo
router.get('/', async (req, res) => {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'Parâmetro "q" é obrigatório' });

    try {
        const results = await wattpad(q);
        res.status(200).json({ status: 200, results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota de perfil de usuário: /api/wattpad/user?username=nome
router.get('/user', async (req, res) => {
    const username = req.query.username;
    if (!username) return res.status(400).json({ error: 'Parâmetro "username" é obrigatório' });

    try {
        const profile = await wattpadUser(username);
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;