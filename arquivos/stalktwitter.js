// arquivos/stalkertwitter.js
// CommonJS router que usa a API pública do twitter-viewer.com para buscar dados de perfis
// Agora usa ?name= em vez de /:username

const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/', async (req, res) => {
  const username = req.query.name;
  if (!username) return res.status(400).json({ error: 'Parâmetro name é obrigatório, exemplo: ?name=elonmusk' });

  const apiUrl = `https://www.twitter-viewer.com/api/x/user?username=${encodeURIComponent(username)}`;

  try {
    const { data } = await axios.get(apiUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.twitter-viewer.com/',
        'Origin': 'https://www.twitter-viewer.com'
      },
      timeout: 15000
    });

    if (!data || !data.success) {
      return res.status(404).json({ error: 'Usuário não encontrado ou resposta inválida' });
    }

    const user = data.data;
    return res.json({
      username: user.handle,
      displayName: user.displayName,
      verified: user.isVerified,
      bio: user.bio,
      location: user.location,
      joinDate: user.joinDate,
      banner: user.banner,
      avatar: user.avatar,
      tweets: user.tweetsCount,
      followers: user.followersCount,
      following: user.followingCount,
      website: user.website?.url || null,
      protected: user.protected
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Falha ao buscar perfil',
      details: err.message
    });
  }
});

module.exports = router;