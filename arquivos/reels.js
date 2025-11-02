const express = require('express');
const axios = require('axios');
const router = express.Router();

// Função de pesquisa Reels do Instagram
async function pesquisarReels(termo) {
  try {
    const url = `https://api.vreden.my.id/api/v1/search/instagram/reels`;
    const response = await axios.get(url, {
      params: { query: termo },
    });

    if (response.data && response.data.result) {
      return response.data.result;
    } else {
      throw new Error('Nenhum resultado encontrado');
    }
  } catch (error) {
    console.error('Erro ao pesquisar Reels:', error.message);
    throw new Error('Erro ao obter resultados');
  }
}

// Rota principal: /api/reels?q=flash
router.get('/', async (req, res) => {
  const q = req.query.q;
  if (!q)
    return res.status(400).json({ error: 'Parâmetro "q" é obrigatório' });

  try {
    const resultados = await pesquisarReels(q);
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