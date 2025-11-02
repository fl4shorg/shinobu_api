const express = require('express');
const axios = require('axios');
const router = express.Router();

// Função de pesquisa Google
async function pesquisarGoogle(termo, count = 10) {
  try {
    const url = `https://api.vreden.my.id/api/v1/search/google`;
    const response = await axios.get(url, {
      params: { query: termo, count },
    });

    if (response.data && response.data.result) {
      return response.data.result;
    } else {
      throw new Error('Nenhum resultado encontrado');
    }
  } catch (error) {
    console.error('Erro ao pesquisar Google:', error.message);
    throw new Error('Erro ao obter resultados');
  }
}

// Rota principal: /api/google?q=free+fire Bot&count=10
router.get('/', async (req, res) => {
  const q = req.query.q;
  const count = req.query.count || 10;

  if (!q)
    return res.status(400).json({ error: 'Parâmetro "q" é obrigatório' });

  try {
    const resultados = await pesquisarGoogle(q, count);
    res.status(200).json({
      statusCode: 200,
      author: 'Neext',
      results: resultados,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;