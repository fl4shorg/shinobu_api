const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const translate = require('@vitalets/google-translate-api');
const router = express.Router();

// Função para buscar página da Wikipédia por termo
async function searchWikipedia(term) {
    try {
        // Pesquisa na Wikipédia
        const searchUrl = `https://id.wikipedia.org/w/index.php?search=${encodeURIComponent(term)}`;
        const { data } = await axios.get(searchUrl);
        const $ = cheerio.load(data);

        // Pega o primeiro link de resultado
        let pageUrl = $('#mw-content-text .searchresult a').first().attr('href');
        if (!pageUrl) pageUrl = `/wiki/${encodeURIComponent(term)}`; // fallback
        const fullUrl = `https://id.wikipedia.org${pageUrl}`;
        return fullUrl;
    } catch (error) {
        console.error('Erro ao pesquisar Wikipédia:', error.message);
        return null;
    }
}

// Função para extrair dados da página e traduzir o conteúdo
async function washi(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const contentTitle = $("#firstHeading").text().trim();

        const content = [];
        $("#mw-content-text .mw-parser-output > p").each((i, el) => {
            const text = $(el).text().replace(/\[\d+\]/g, "").trim();
            if (text) content.push(text);
        });

        // Traduzir cada parágrafo para português em paralelo
        const translatedContent = await Promise.all(
            content.slice(0, 7).map(async (para) => {
                try {
                    const res = await translate(para, { to: 'pt' });
                    return res.text;
                } catch {
                    return para; // fallback se der erro
                }
            })
        );

        const images = [];
        $("#mw-content-text .mw-parser-output img").each((i, el) => {
            if (i >= 3) return false; // pega no máximo 3 imagens
            const src = $(el).attr("src");
            if (src) images.push(src.startsWith("http") ? src : "https:" + src);
        });

        const infobox = {};
        $(".infobox tr").each((i, el) => {
            const th = $(el).find("th").first().text().trim();
            const tdEl = $(el).find("td").first();
            let td = "";
            if (tdEl.find("li").length) {
                td = tdEl
                    .find("li")
                    .map((i, li) => $(li).text().trim())
                    .get()
                    .join(", ");
            } else {
                td = tdEl.text().trim();
            }
            td = td.replace(/\[\w+\]/g, "");
            if (th && td) infobox[th] = td;
        });

        return {
            contentTitle,
            content: translatedContent,
            images,
            infobox
        };

    } catch (error) {
        console.error('Erro ao buscar Wikipédia:', error.message);
        return { error: error.message };
    }
}

// Rota: /api/wikipedia2?query=termo
router.get('/', async (req, res) => {
    const query = req.query.query;
    if (!query) return res.status(400).json({ error: 'Parâmetro "query" é obrigatório' });

    try {
        const url = await searchWikipedia(query);
        if (!url) return res.status(404).json({ error: 'Página não encontrada' });

        const result = await washi(url);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;