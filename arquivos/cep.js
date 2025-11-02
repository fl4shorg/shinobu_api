const express = require("express");
const axios = require("axios");

const router = express.Router();

// Rota GET /cep?cep=01001000
router.get("/", async (req, res) => {
    const { cep } = req.query;

    if (!cep) return res.status(400).json({ error: "Parâmetro 'cep' é obrigatório" });

    try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (response.data.erro) {
            return res.status(404).json({ error: "CEP não encontrado" });
        }
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar CEP", details: err.message });
    }
});

module.exports = router;