const express = require("express");
const axios = require("axios");

const router = express.Router();

// Função para buscar produtos no Mercado Livre
const MercadoLivreSearch = async (keyword, maxItems = 10) => {
    if (!keyword) throw new Error("O parâmetro 'keyword' é obrigatório");

    try {
        const res = await axios.get("https://api.mercadolibre.com/sites/MLB/search", {
            params: { q: keyword, limit: maxItems },
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json"
            }
        });

        const resultados = res.data.results.map(item => ({
            produto: item.title,
            valor: `R$ ${item.price}`,
            link: item.permalink,
            imagem: item.thumbnail
        }));

        return {
            status: 200,
            criador: "Seu Nome",
            resultado: resultados
        };

    } catch (err) {
        const details = err.response?.data || err.message || err;
        throw new Error(JSON.stringify(details));
    }
};

// Rota GET /search
router.get("/search", async (req, res) => {
    const { q, maxItems } = req.query;
    if (!q) return res.status(400).json({ error: "Parâmetro 'q' é obrigatório" });

    try {
        const resultado = await MercadoLivreSearch(q, Number(maxItems) || 10);
        res.json(resultado);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar produtos", details: err.message });
    }
});

// Rota GET /top10 (usa maxItems=10)
router.get("/top10", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Parâmetro 'q' é obrigatório" });

    try {
        const resultado = await MercadoLivreSearch(q, 10);
        res.json(resultado);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar top 10", details: err.message });
    }
});

module.exports = router;