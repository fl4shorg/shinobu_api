const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * Rota: /api/fakepessoa
 * Query opcional:
 *  - results (número de pessoas, padrão 1)
 * Exemplo:
 *  /api/fakepessoa?results=3
 */
router.get('/', async (req, res) => {
  const results = parseInt(req.query.results) || 1;
  try {
    const apiUrl = `https://randomuser.me/api/?nat=br&results=${encodeURIComponent(results)}`;
    const { data } = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      },
      timeout: 15000
    });

    // Se quiser esconder campos sensíveis (login, id, etc.), filtrar aqui.
    // No momento retornamos apenas o objeto "results" e alguns metadados.
    const people = Array.isArray(data.results) ? data.results : [];

    res.status(200).json({
      statusCode: 200,
      info: data.info || {},
      results: people
    });
  } catch (error) {
    console.error('Erro ao consultar API RandomUser:', error.message);
    const msg = error.response?.data || error.message;
    res.status(500).json({ status: false, message: msg });
  }
});

module.exports = router;