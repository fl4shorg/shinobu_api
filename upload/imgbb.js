const express = require('express');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const FormData = require('form-data');

const router = express.Router();

// Configurações ImgBB
const API_KEY = '3d9fa0bdf06acddf7b9b0e0122b2dc9d';
const EXPIRATION = 3600; // 1 hora

// Middleware para aceitar arquivos
router.use(fileUpload());

// POST /upload -> upload via arquivo
router.post('/', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    const image = req.files.image;

    // Converte o arquivo para base64 na memória
    const buffer = image.data.toString('base64');

    // Envia para ImgBB
    const form = new FormData();
    form.append('key', API_KEY);
    form.append('image', buffer);
    form.append('expiration', EXPIRATION);

    const response = await axios.post('https://api.imgbb.com/1/upload', form, {
      headers: form.getHeaders(),
    });

    if (response.data.success) {
      return res.json({
        url: response.data.data.url,
        viewer_url: response.data.data.url_viewer,
        delete_url: response.data.data.delete_url,
      });
    } else {
      return res.status(500).json({ error: 'Falha no upload para ImgBB' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /upload-base64 -> upload via base64
router.post('/upload-base64', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Nenhuma imagem em base64 enviada' });
    }

    const form = new FormData();
    form.append('key', API_KEY);
    form.append('image', image);
    form.append('expiration', EXPIRATION);

    const response = await axios.post('https://api.imgbb.com/1/upload', form, {
      headers: form.getHeaders(),
    });

    if (response.data.success) {
      return res.json({
        url: response.data.data.url,
        viewer_url: response.data.data.url_viewer,
        delete_url: response.data.data.delete_url,
      });
    } else {
      return res.status(500).json({ error: 'Falha no upload para ImgBB' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;