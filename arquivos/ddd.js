const express = require("express");
const axios = require("axios");

const router = express.Router();
const API_URL = "https://brasilapi.com.br/api/ddd/v1";

// Rota: /ddd?numero=11
router.get("/", async (req, res) => {
    const { numero } = req.query;

    if (!numero) {
        return res.status(400).json({ error: "Parâmetro 'numero' é obrigatório" });
    }

    try {
        const response = await axios.get(`${API_URL}/${numero}`, {
            headers: { Accept: "application/json" }
        });

        res.json({
            status: 200,
            ddd: response.data.ddd,
            estado: response.data.state,
            cidades: response.data.cities
        });
    } catch (err) {
        res.status(500).json({
            error: "Erro ao buscar informações do DDD",
            details: err.response?.data || err.message
        });
    }
});

module.exports = router;