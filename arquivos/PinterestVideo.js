const express = require('express');
const axios = require('axios');

const router = express.Router();

// Função que consulta a API e espera o vídeo ficar pronto
async function scrapePinterest(url, attempts = 5, delay = 2000) {
  if (!url) throw new Error('Parâmetro de URL obrigatório');

  for (let i = 0; i < attempts; i++) {
    try {
      const apiUrl = `https://savepinmedia.com/php/api/api.php?url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(apiUrl, {
        headers: {
          Accept: '*/*',
          'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: 15000 // 15 segundos
      });

      if (!data) throw new Error('Resposta vazia da API');

      // Se houver resultados de vídeo, retorna
      const media = data.results.filter((link) => link.endsWith('.mp4'));
      if (media.length > 0) {
        return {
          status: true,
          media,
          type: 'mp4'
        };
      }

      // Se não houver vídeo, aguarda e tenta novamente
      await new Promise((resolve) => setTimeout(resolve, delay));

    } catch (err) {
      console.error(`Tentativa ${i + 1} falhou:`, err.message);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Se após todas as tentativas não encontrar vídeo
  return { status: false, error: 'Vídeo não processado ainda ou URL inválida' };
}

// Rota GET — aceita qualquer URL
router.get('/', async (req, res) => {
  const url = req.query.q || req.query.url;
  if (!url) return res.status(400).json({ error: 'Parâmetro de URL obrigatório. Use ?q=...' });

  try {
    const result = await scrapePinterest(url);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;