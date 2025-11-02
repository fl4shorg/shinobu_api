const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

class Wiki {
    async search(query) {
        if(!query) throw new Error('É necessário informar a pesquisa');

        const url = `https://pt.m.wikipedia.org/wiki/${encodeURIComponent(query)}`;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Seleciona o primeiro parágrafo que não esteja vazio
        let paragrafo = $('p').filter((i, el) => $(el).text().trim().length > 0).first().html() || '';
        
        // Remove tags <sup> de referências
        paragrafo = paragrafo.replace(/<sup[^>]*>.*?<\/sup>/g, '');

        // Remove atributos HTML desnecessários
        paragrafo = paragrafo.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');
        paragrafo = paragrafo.replace(/<a[^>]*>/g, '').replace(/<\/a>/g, '');
        paragrafo = paragrafo.replace(/<i[^>]*>/g, '').replace(/<\/i>/g, '');
        paragrafo = paragrafo.replace(/<b[^>]*>/g, '').replace(/<\/b>/g, '');

        const texto = paragrafo.trim();

        return { titulo: query, descricao: texto, url };
    }
}

const wiki = new Wiki();

// Rota GET /wiki?q=Anime
router.get('/wiki', async (req, res) => {
    try {
        const query = req.query.q;
        const resultado = await wiki.search(query);
        res.json({ status: 200, dados: resultado });
    } catch(err) {
        res.status(500).json({ status: 500, erro: err.message });
    }
});

module.exports = router;