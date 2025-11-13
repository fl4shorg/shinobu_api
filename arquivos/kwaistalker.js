// arquivos/kwaistalker.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

// Rota usando query ?name=usuario
router.get('/', async (req, res) => {
  const username = req.query.name;
  if (!username) return res.status(400).json({ error: 'Parâmetro name é obrigatório' });

  const profileUrl = `https://www.kwai.com/@${encodeURIComponent(username)}`;

  try {
    const { data } = await axios.get(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    const $ = cheerio.load(data);

    // Pega título e avatar
    const title = $('title').text() || '';
    const avatar = $('meta[property="og:image"]').attr('content') || null;

    let name = null;
    if (title) {
      const match = title.match(/^(.+?) \(@(.+?)\) on Kwai$/);
      if (match) name = match[1];
    }

    // Pega o JSON do id="Person"
    const personJsonText = $('#Person').html();
    let description = null;
    let likes = null;
    let followers = null;

    if (personJsonText) {
      try {
        const personData = JSON.parse(personJsonText);

        description = personData.mainEntity?.description || null;

        const stats = personData.mainEntity?.interactionStatistic || [];
        for (const stat of stats) {
          if (!likes && stat.interactionType?.['@type'] === 'https://schema.org/LikeAction') {
            likes = stat.userInteractionCount;
          }
          if (!followers && stat.interactionType?.['@type'] === 'https://schema.org/FollowAction') {
            followers = stat.userInteractionCount;
          }
          if (likes !== null && followers !== null) break;
        }
      } catch (e) {
        // JSON inválido, ignora
      }
    }

    res.json({
      username,
      name,
      profileUrl, // link direto do Kwai
      avatar,
      description,
      likes,
      followers
    });

  } catch (err) {
    res.status(500).json({ error: 'Falha ao buscar perfil', details: err.message });
  }
});

module.exports = router;