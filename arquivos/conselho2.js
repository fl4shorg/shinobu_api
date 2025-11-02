const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();
const BASE_URL = "https://www.pensador.com/frases_de_conselhos/";

// Rota: /conselho2
router.get("/", async (req, res) => {
    try {
        const response = await axios.get(BASE_URL);
        const $ = cheerio.load(response.data);

        const frases = [];

        // Captura todas as frases <p class="frase fr" id="..."> e autor logo abaixo
        $("p.frase.fr").each((_, el) => {
            const texto = $(el).text().trim();
            // Autor está no próximo elemento <div class="autor">
            const autor = $(el).next("div.autor").find(".author-name").text().trim() || "Desconhecido";
            if (texto) frases.push({ frase: texto, autor });
        });

        if (frases.length === 0) {
            return res.status(404).json({ error: "Nenhuma frase encontrada" });
        }

        // Retorna uma frase aleatória
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