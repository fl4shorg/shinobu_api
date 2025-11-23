// arquivos/emojimix.js
const express = require('express');
const axios = require('axios');

const router = express.Router();

/*
  Endpoint: /emojimix?e1=🥹&e2=😡&size=128
*/

router.get('/', async (req, res) => {
  try {
    const { e1, e2, size } = req.query;

    if (!e1 || !e2) {
      return res.status(400).json({
        erro: true,
        mensagem: "Use: /emojimix?e1=🥹&e2=😡"
      });
    }

    const finalSize = size || 128;

    // Monta a URL do emojimix
    const url = `https://emojik.vercel.app/s/${encodeURIComponent(e1)}_${encodeURIComponent(e2)}?size=${finalSize}`;

    // Busca a imagem
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    res.set('Content-Type', 'image/png');
    return res.send(response.data);

  } catch (err) {
    return res.status(500).json({
      erro: true,
      mensagem: "Erro ao gerar emoji-mix.",
      detalhes: err.message
    });
  }
});

module.exports = router;