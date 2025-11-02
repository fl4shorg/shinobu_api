const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const router = express.Router();

// Função para baixar dados do Spotify
const spotifyTrackDownloader = async (spotifyTrackUrl) => {
  const client = new axios.create({
    baseURL: 'https://spotisongdownloader.to',
    headers: {
      'Accept-Encoding': 'gzip, deflate, br',
      'cookie': `PHPSESSID=${crypto.randomBytes(16).toString('hex')}; _ga=GA1.1.2675401.${Math.floor(Date.now()/1000)}`,
      'referer': 'https://spotisongdownloader.to',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  const { data: meta } = await client.get('/api/composer/spotify/xsingle_track.php', { params: { url: spotifyTrackUrl } });
  await client.post('/track.php');
  const { data: dl } = await client.post('/api/composer/spotify/ssdw23456ytrfds.php', {
    url: spotifyTrackUrl,
    zip_download: "false",
    quality: "m4a"
  });

  return { ...dl, ...meta };
};

// Rota relativa "/"
router.get('/', async (req, res) => {
  const spotifyUrl = req.query.url;
  if (!spotifyUrl) {
    return res.status(400).json({
      api: 'API desenvolvida pela Neext',
      instagram: '@neet.tk',
      status: 'error',
      message: 'Parâmetro "url" é obrigatório'
    });
  }

  try {
    const result = await spotifyTrackDownloader(spotifyUrl);
    res.status(200).json({
      api: 'API desenvolvida pela Neext',
      instagram: '@neet.tk',
      status: 'success',
      message: 'Dados do Spotify obtidos com sucesso',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      api: 'API desenvolvida pela Neext',
      instagram: '@neet.tk',
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;