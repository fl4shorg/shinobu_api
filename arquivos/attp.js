// attp.js
const express = require('express');
const axios = require('axios');

const router = express.Router();

// Rota para gerar ATTp
router.get('/', async (req, res) => {
  try {
    const text = req.query.text || 'Hello';

    // Chamada para a API externa pedindo que retorne como arraybuffer (binário)
    const response = await axios.get('https://anabot.my.id/api/maker/attp', {
      params: { text, apikey: 'freeApikey' },
      responseType: 'arraybuffer', // MUITO IMPORTANTE para imagens
      headers: { accept: '*/*' }
    });

    // Define o tipo de conteúdo como imagem
    res.set('Content-Type', 'image/png');

    // Envia o buffer da imagem
    res.send(response.data);

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro ao gerar ATTp');
  }
});

module.exports = router;