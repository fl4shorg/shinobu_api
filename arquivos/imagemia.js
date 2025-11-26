const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

async function gerarImagemIA(prompt, estilo = 'anime') {
  try {
    const estilosDisponiveis = ['photorealistic', 'digital-art', 'impressionist', 'anime', 'fantasy', 'sci-fi', 'vintage'];
    if (!prompt) throw new Error('Prompt é obrigatório.');
    if (!estilosDisponiveis.includes(estilo)) throw new Error(`Estilos disponíveis: ${estilosDisponiveis.join(', ')}.`);

    const { data: html } = await axios.get('https://unrestrictedaiimagegenerator.com/', {
      headers: {
        origin: 'https://unrestrictedaiimagegenerator.com',
        referer: 'https://unrestrictedaiimagegenerator.com/',
        'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
      }
    });

    const $ = cheerio.load(html);
    const nonce = $('input[name="_wpnonce"]').attr('value');
    if (!nonce) throw new Error('Nonce não encontrado.');

    const { data } = await axios.post(
      'https://unrestrictedaiimagegenerator.com/',
      new URLSearchParams({
        generate_image: true,
        image_description: prompt,
        image_style: estilo,
        _wpnonce: nonce
      }).toString(),
      {
        headers: {
          origin: 'https://unrestrictedaiimagegenerator.com',
          referer: 'https://unrestrictedaiimagegenerator.com/',
          'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
        }
      }
    );

    const $$ = cheerio.load(data);
    const imagemURL = $$('img#resultImage').attr('src');
    if (!imagemURL) throw new Error('Nenhum resultado encontrado.');
    return imagemURL;

  } catch (erro) {
    throw new Error(erro.message);
  }
}

// Rota GET para gerar imagem e enviar como stream
router.get('/gerar', async (req, res) => {
  const { prompt, estilo } = req.query;
  try {
    const imagemURL = await gerarImagemIA(prompt, estilo);

    // faz o download da imagem como stream
    const response = await axios.get(imagemURL, { responseType: 'stream' });

    // define headers
    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Content-Length', response.headers['content-length']);

    // envia como stream
    response.data.pipe(res);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;