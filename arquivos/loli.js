const express = require('express');
const axios = require('axios');
const router = express.Router();

// Rota relativa "/" no router
router.get('/', async (req, res) => {
  try {
    const response = await axios({
      url: 'https://api.nekolabs.my.id/random/loli',
      method: 'GET',
      responseType: 'stream'
    });

    // Define o tipo de conteúdo correto
    res.setHeader('Content-Type', response.headers['content-type']);

    // Envia a imagem diretamente
    response.data.pipe(res);
  } catch (error) {
    console.error('Erro ao buscar imagem loli:', error.message);
    res.status(500).send('Erro ao buscar imagem loli');
  }
});

module.exports = router;