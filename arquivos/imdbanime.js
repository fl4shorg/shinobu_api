const express = require("express");
const axios = require("axios");
const translate = require("@vitalets/google-translate-api");

const router = express.Router();
const BASE_URL = "https://kitsu.io/api/edge";

// Função para traduzir texto para português
async function traduzir(texto) {
    try {
        const res = await translate(texto, { to: "pt" });
        return res.text;
    } catch (err) {
        console.error("Erro ao traduzir:", err.message);
        return texto; // retorna o original se falhar
    }
}

// Buscar anime pelo nome
router.get("/anime", async (req, res) => {
    const { nome } = req.query;
    if (!nome) return res.status(400).json({ error: "Parâmetro 'nome' é obrigatório" });

    try {
        const response = await axios.get(`${BASE_URL}/anime`, {
            params: {
                "filter[text]": nome,
                "page[limit]": 1
            }
        });

        if (response.data.data.length === 0) {
            return res.status(404).json({ message: "Anime não encontrado" });
        }

        const anime = response.data.data[0].attributes;

        // Mantendo o título original e traduzindo apenas a descrição
        const tituloOriginal = anime.canonicalTitle;
        const descricaoPT = anime.synopsis ? await traduzir(anime.synopsis) : null;

        res.json({
            id: response.data.data[0].id,
            titulo: tituloOriginal, // título NÃO traduzido
            descricao: descricaoPT,
            nota: anime.averageRating,
            lancamento: anime.startDate,
            capa: anime.posterImage ? anime.posterImage.original : null
        });
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar anime", details: err.message });
    }
});

// Top 10 animes populares
router.get("/top10", async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/trending/anime`, {
            params: {
                "page[limit]": 10
            }
        });

        const top10 = await Promise.all(response.data.data.map(async item => {
            const anime = item.attributes;

            const tituloOriginal = anime.canonicalTitle; // título sem tradução
            const descricaoPT = anime.synopsis ? await traduzir(anime.synopsis) : null;

            return {
                id: item.id,
                titulo: tituloOriginal,
                descricao: descricaoPT,
                nota: anime.averageRating,
                lancamento: anime.startDate,
                capa: anime.posterImage ? anime.posterImage.original : null
            };
        }));

        res.json(top10);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar top 10", details: err.message });
    }
});

module.exports = router;