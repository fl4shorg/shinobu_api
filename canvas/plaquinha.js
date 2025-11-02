const express = require('express');
const axios = require('axios');
const router = express.Router();

// Templates das plaquinhas (backgrounds)
const plaquinhas = [
  'https://neextltda.sirv.com/plaquinha/images%20(2).jpg',
  'https://neextltda.sirv.com/plaquinha/Bhl5Ha_CcAAJLK8%20(1).jpg',
  'https://neextltda.sirv.com/plaquinha/images%20(1).jpg',
  'https://neextltda.sirv.com/plaquinha/f5c4a233981b33d51ffaa67c54bf5aab.jpg',
  'https://neextltda.sirv.com/plaquinha/Ezs0bkHXoAcMhBg.jpg',
  'https://neextltda.sirv.com/plaquinha/artworks-RF1W1LpyCncbdvnB-F15uQg-t500x500.jpg',
  'https://neextltda.sirv.com/plaquinha/23856206.jpg',
  'https://neextltda.sirv.com/plaquinha/7940e86e3c5aee5a112c854cd1f92912.jpg',
  'https://neextltda.sirv.com/plaquinha/th.jpeg',
  'https://neextltda.sirv.com/plaquinha/Mulheres-bundudas-garimpadas-da-internet-2.jpg'
];

// Configurações de texto para cada plaquinha
const configs = [
  { color: '000000', opacity: 50, font: 'Caveat', size: 80, x: 140, y: null, gravity: 'west' },
  { color: '000000', opacity: 30, font: 'Caveat', size: 100, x: 320, y: -300, gravity: 'west' },
  { color: '000000', opacity: 30, font: 'Caveat', size: 55, x: 320, y: 10, gravity: 'west' },
  { color: '000000', opacity: 50, font: 'Caveat', size: 70, x: 260, y: 210, gravity: 'west' },
  { color: '000000', opacity: 50, font: 'Caveat', size: 60, x: 180, y: 0, gravity: 'west' },
  { color: '000000', opacity: 30, font: 'Caveat', size: 50, x: 180, y: 60, gravity: 'west' },
  { color: '000000', opacity: 40, font: 'Reenie%20Beanie', size: 20, x: '5%', y: '28%', gravity: 'center' },
  { color: '000000', opacity: 30, font: 'Caveat', size: 70, x: 350, y: 160, gravity: 'west' },
  { color: '000000', opacity: 30, font: 'Caveat', size: 50, x: null, y: 40, gravity: 'center' },
  { color: '000000', opacity: 30, font: 'Caveat', size: 30, x: 160, y: 120, gravity: 'west' },
];

// Rota: /api/plaquinha?num=1&text=SeuNome
router.get('/', async (req, res) => {
  const num = parseInt(req.query.num);
  const text = req.query.text;

  if (!num || num < 1 || num > plaquinhas.length)
    return res.status(400).json({ error: `Parâmetro "num" inválido. Use 1 a ${plaquinhas.length}` });

  if (!text) return res.status(400).json({ error: 'Parâmetro "text" é obrigatório' });

  const idx = num - 1;
  const plaquinhaURL = plaquinhas[idx];
  const config = configs[idx];

  // Monta a URL final com o texto
  const url = `${plaquinhaURL}?text.0.text=${encodeURIComponent(text)}&text.0.color=${config.color}&text.0.opacity=${config.opacity}&text.0.font.family=${config.font}&text.0.font.size=${config.size}${config.x !== null ? `&text.0.position.x=${config.x}` : ''}${config.y !== null ? `&text.0.position.y=${config.y}` : ''}&text.0.position.gravity=${config.gravity}`;

  try {
    // Faz o download da imagem e retorna em stream
    const response = await axios.get(url, { responseType: 'stream' });
    res.setHeader('Content-Type', 'image/jpeg');
    response.data.pipe(res);
  } catch (error) {
    console.error('Erro ao buscar a plaquinha:', error.message);
    res.status(500).json({ error: 'Erro ao gerar a plaquinha' });
  }
});

module.exports = router;