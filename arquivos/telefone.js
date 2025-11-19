const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_NOTE = {
  api: 'API desenvolvida pela Neext',
  instagram: '@neet.tk'
};

// ROTA: GET /telefone/verify?phone=NUMERO
router.get('/verify', async (req, res) => {
  const phone = req.query.phone;

  if (!phone) {
    return res.status(400).json({
      ...API_NOTE,
      status: 'error',
      message: 'Parâmetro "phone" é obrigatório (ex: ?phone=+5527777777777)'
    });
  }

  try {
    const response = await axios.get('https://api.veriphone.io/v2/verify', {
      params: {
        phone: phone,
        key: '7145CD1AB5A541A8BC54768B813D017D'
      }
    });

    return res.status(200).json({
      ...API_NOTE,
      status: 'success',
      data: response.data
    });

  } catch (error) {
    return res.status(500).json({
      ...API_NOTE,
      status: 'error',
      message: error.response?.data || error.message
    });
  }
});

module.exports = router;