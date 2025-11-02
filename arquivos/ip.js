const express = require("express");
const axios = require("axios");

const router = express.Router();

// Rota GET /ip?ip=8.8.8.8
router.get("/", async (req, res) => {
    const { ip } = req.query;

    if (!ip) return res.status(400).json({ error: "Parâmetro 'ip' é obrigatório" });

    try {
        const response = await axios.get(`https://ipapi.co/${ip}/json/`);
        if (response.data.error) {
            return res.status(404).json({ error: "IP não encontrado" });
        }
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar IP", details: err.message });
    }
});

module.exports = router;