const express = require('express');
const axios = require('axios');
const router = express.Router();

// Rota: /api/stalkroblox?user=username
router.get('/', async (req, res) => {
  const user = req.query.user;
  if (!user) return res.status(400).json({ error: 'Parâmetro "user" é obrigatório' });

  try {
    const apiUrl = `https://api.zenzxz.my.id/api/stalker/roblox?user=${encodeURIComponent(user)}`;
    const { data } = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    // Retorna apenas os dados do usuário
    const userData = data?.data || {};
    res.status(200).json({
      statusCode: 200,
      result: userData
    });

  } catch (error) {
    console.error('Erro ao consultar API Roblox stalker:', error.message);
    const msg = error.response?.data || error.message;
    res.status(500).json({ status: false, message: msg });
  }
});

module.exports = router;