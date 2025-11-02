const express = require("express");
const axios = require("axios");

const router = express.Router();

const API_URL = "https://api.invertexto.com/v1/faker";
const TOKEN = "22515|VFT2zn9oYvBK9ofWwXPnxZjGyS5YZ1HL";

// Rota GET /pessoa
router.get("/", async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}?token=${TOKEN}`);

        if (!response.data) {
            return res.status(404).json({ error: "Não foi possível gerar pessoa" });
        }

        res.json({
            status: 200,
            criador: "Seu Nome",
            resultado: response.data
        });
    } catch (err) {
        res.status(500).json({
            error: "Erro ao gerar pessoa",
            details: err.response?.data || err.message
        });
    }
});

module.exports = router;