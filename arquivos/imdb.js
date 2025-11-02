const express = require("express");
const axios = require("axios");

const router = express.Router();

const API_KEY = "22ee2833df76ca9621acecddc5c7fcb9";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"; // tamanho médio do poster

// Buscar filme pelo nome
router.get("/filme", async (req, res) => {
    const { nome } = req.query;
    if (!nome) return res.status(400).json({ error: "Parâmetro 'nome' é obrigatório" });

    try {
        const response = await axios.get(`${BASE_URL}/search/movie`, {
            params: {
                api_key: API_KEY,
                query: nome,
                language: "pt-BR",
            }
        });

        if (response.data.results.length === 0) {
            return res.status(404).json({ message: "Filme não encontrado" });
        }

        const filme = response.data.results[0];
        res.json({
            id: filme.id,
            titulo: filme.title,
            descricao: filme.overview,
            nota: filme.vote_average,
            lancamento: filme.release_date,
            capa: filme.poster_path ? IMAGE_BASE_URL + filme.poster_path : null
        });
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar filme", details: err.message });
    }
});

// Top 10 filmes populares
router.get("/top10", async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/movie/popular`, {
            params: {
                api_key: API_KEY,
                language: "pt-BR",
                page: 1
            }
        });

        const top10 = response.data.results.slice(0, 10).map(filme => ({
            id: filme.id,
            titulo: filme.title,
            nota: filme.vote_average,
            lancamento: filme.release_date,
            capa: filme.poster_path ? IMAGE_BASE_URL + filme.poster_path : null
        }));

        res.json(top10);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar top 10", details: err.message });
    }
});

module.exports = router;