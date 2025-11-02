const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

const BASE_URL = "https://pt.quotes.pics/conselho/frases";

// Rota: /conselho1
router.get("/", async (req, res) => {
    try {
        const response = await axios.get(BASE_URL);
        const $ = cheerio.load(response.data);

        const frases = [];

        // Captura todas as frases dentro de <b id="...">
        $("b[id]").each((_, el) => {
            const texto = $(el).text().trim();
            if (texto) frases.push(texto);
        });

        if (frases.length === 0) {
            return res.status(404).json({ error: "Nenhuma frase encontrada" });
        }

        // Sempre retorna uma frase aleatória
        const resultado = frases[Math.floor(Math.random() * frases.length)];

        res.json({
            status: 200,
            resultado
        });
    } catch (err) {
        res.status(500).json({
            error: "Erro ao buscar conselhos",
            details: err.message
        });
    }
});

module.exports = router;