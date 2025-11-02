const express = require("express");
const axios = require("axios");

const router = express.Router();

const API_URL = "https://api.encurtador.dev/encurtamentos";

// Rota GET /encurtar?url=https://google.com
router.get("/", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "Parâmetro 'url' é obrigatório" });

    try {
        const response = await axios.post(
            API_URL,
            { url },
            { headers: { "Content-Type": "application/json" } }
        );

        res.json({
            status: 200,
            original: url,
            encurtado: response.data.urlEncurtada || response.data.resultado || response.data,
        });
    } catch (err) {
        res.status(500).json({
            error: "Erro ao encurtar link",
            details: err.response?.data || err.message
        });
    }
});

module.exports = router;