const express = require('express');
const axios = require('axios');
const router = express.Router();

// Função para scrapear o TikTok
async function scrapeTikTok(username) {
    const ip = `${Math.floor(Math.random()*255)+1}.${Math.floor(Math.random()*255)+1}.${Math.floor(Math.random()*255)+1}.${Math.floor(Math.random()*255)+1}`;
    const ua = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    
    const { data } = await axios.get(`https://www.tiktok.com/@${encodeURIComponent(username)}`, {
        headers: {
            'User-Agent': ua,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'X-Forwarded-For': ip,
            'X-Real-IP': ip
        },
        timeout: 10000
    });

    const match = data.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/s);
    if (!match) return null;

    const json = JSON.parse(match[1]);
    const info = json.__DEFAULT_SCOPE__?.['webapp.user-detail']?.userInfo || {};
    const user = info.user || {};
    const stats = info.stats || {};

    if (!user.id) return null;

    return {
        id: user.id,
        uniqueId: user.uniqueId,
        nickname: user.nickname,
        bio: user.signature?.trim() || 'No bio yet',
        region: user.region,
        verified: user.verified,
        private: user.privateAccount,
        avatar: user.avatarLarger,
        followers: stats.followerCount,
        following: stats.followingCount,
        hearts: stats.heartCount,
        videos: stats.videoCount,
        profile_link: `https://www.tiktok.com/@${user.uniqueId}`
    };
}

// Rota: /api/ttstalk?username=...
router.get('/', async (req, res) => {
    const username = req.query.username;
    if (!username) return res.status(400).json({ error: 'Parâmetro "username" é obrigatório' });

    try {
        const result = await scrapeTikTok(username);
        if (!result) return res.status(404).json({ error: 'Usuário não encontrado' });

        res.status(200).json({ status: 200, result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;