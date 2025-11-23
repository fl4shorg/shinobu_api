// canvas/pet.js
const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/canvas/pet", async (req, res) => {
    try {
        const avatar = req.query.avatar;

        if (!avatar) {
            return res.status(400).json({
                error: true,
                message: "Parâmetro 'avatar' é obrigatório"
            });
        }

        // Faz a requisição para o endpoint da Some Random API
        const apiUrl = `https://api.some-random-api.com/premium/petpet?avatar=${encodeURIComponent(avatar)}`;

        const response = await axios.get(apiUrl, {
            responseType: "arraybuffer" // ← importante para retornar imagem
        });

        // Retorna a imagem direto pro usuário
        res.set({
            "Content-Type": "image/gif", // normalmente petpet retorna gif
            "Content-Length": response.data.length
        });

        res.send(response.data);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: true,
            message: "Erro ao gerar a imagem"
        });
    }
});

module.exports = router;