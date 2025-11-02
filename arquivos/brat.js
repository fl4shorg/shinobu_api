const express = require('express');
const router = express.Router();
const axios = require('axios');

// Rota /brat?text=SeuTextoAqui
router.get('/', async (req, res) => {
  const texto = req.query.text;
  if (!texto) return res.status(400).send('Parâmetro "text" é obrigatório');

  try {
    const url = 'https://aqul-brat.hf.space/?text=' + encodeURIComponent(texto);

    // Faz o download da imagem da API como stream
    const response = await axios({
      method: 'GET',
      url,
      responseType: 'stream'
    });

    res.setHeader('Content-Type', response.headers['content-type']);
    response.data.pipe(res);
  } catch (error) {
    console.error('Erro ao acessar Brat API:', error.message);
    res.status(500).send('Erro ao acessar Brat API. Talvez o servidor esteja offline.');
  }
});

module.exports = router;