// arquivos/freepik.js
const express = require('express');
const axios = require('axios');

const router = express.Router();

const freepik = {
  search: async (q) => {
    if (!q) throw new Error('Query is required');
    const { data } = await axios.get(
      `https://www.freepik.com/api/regular/search?filters[ai-generated][excluded]=1&filters[content_type]=photo&locale=en&page=${Math.floor(Math.random() * 100) + 1}&term=${encodeURIComponent(q)}`,
      {
        headers: {
          'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
        }
      }
    );

    return data.items.map(item => {
      const d = new Date(item.created || Date.now());
      return {
        title: item.name,
        type: item.type,
        mimetype: item.encodingFormat || null,
        is_premium: item.premium,
        is_aigenerated: item.isAIGenerated,
        relatedTags: item.relatedTags ? item.relatedTags.map(t => t.name) : [],
        author: {
          name: item.author.name,
          avatar: item.author.avatar,
          url: `https://www.freepik.com/author/${item.author.slug}`
        },
        previewUrl: item.preview.url,
        url: item.url,
        created: `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
      };
    });
  },

  download: async (url) => {
    const match = url.match(/_(\d+)\.htm$/);
    if (!match) throw new Error('Invalid url');
    const id = match[1];

    const { data } = await axios.get(
      `https://www.freepik.com/api/regular/download?resource=${id}&action=download&locale=en`,
      {
        headers: {
          'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
        }
      }
    );

    return data;
  }
};

// 🔍 Rota de pesquisa
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'Informe ?q=' });
    const results = await freepik.search(q);

    res.json({
      api: 'Desenvolvida pela Neext',
      query: q,
      results
    });
  } catch (err) {
    console.error('[freepik/search]', err.message);
    res.status(500).json({ error: 'Erro ao pesquisar.', details: err.message });
  }
});

// ⬇️ Rota de download
router.get('/download', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'Informe ?url=' });
    const result = await freepik.download(url);

    res.json({
      api: 'Desenvolvida pela Neext',
      url,
      result
    });
  } catch (err) {
    console.error('[freepik/download]', err.message);
    res.status(500).json({ error: 'Erro ao baixar.', details: err.message });
  }
});

module.exports = router;