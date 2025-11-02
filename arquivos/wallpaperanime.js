const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                '(KHTML, like Gecko) Chrome/115.0 Safari/537.36'
};

// Função para tentar pegar uma imagem válida
async function getValidImage(images) {
  const shuffled = images.sort(() => 0.5 - Math.random()); // embaralha
  for (let img of shuffled) {
    const fullImage = img.replace(/300x168/, '1920x1080');
    try {
      // Tenta acessar a imagem
      await axios.head(fullImage, { headers });
      return fullImage; // se funcionar, retorna
    } catch {
      continue; // se falhar, tenta a próxima
    }
  }
  return null;
}

// GET /api/wallpaperanime
router.get('/', async (req, res) => {
  try {
    // Escolhe uma página aleatória entre 1 e 14
    const page = Math.floor(Math.random() * 14) + 1;
    const url = `https://wallpaperscraft.com/catalog/anime/page${page}`;

    // Pega o HTML da página
    const { data } = await axios.get(url, { headers });
    const $ = cheerio.load(data);

    const images = [];

    // Seleciona todas as imagens com a classe wallpapers__image
    $('img.wallpapers__image').each((_, el) => {
      const src = $(el).attr('src');
      if (src) images.push(src);
    });

    if (!images.length) return res.status(404).send('Nenhum wallpaper encontrado');

    // Tenta pegar uma imagem válida
    const validImage = await getValidImage(images);

    if (!validImage) return res.status(404).send('Nenhum wallpaper disponível no momento');

    // Envia a imagem como stream
    const imageResponse = await axios.get(validImage, { responseType: 'stream', headers });
    res.setHeader('Content-Type', 'image/jpeg');
    imageResponse.data.pipe(res);

  } catch (error) {
    console.error('Erro ao buscar wallpaper:', error.message);
    res.status(500).send('Erro ao buscar wallpaper');
  }
});

module.exports = router;