const express = require("express");
const axios = require("axios");

const router = express.Router();

// Lista de overlays
const BASE = "https://api.some-random-api.com/canvas/overlay";

const overlays = {
    comunismo: `${BASE}/comrade?avatar=`,
    gay: `${BASE}/gay?avatar=`,
    glass: `${BASE}/glass?avatar=`,
    prisao: `${BASE}/jail?avatar=`,
    mission: `${BASE}/passed?avatar=`,
    triggered: `${BASE}/triggered?avatar=`,
    wasted: `${BASE}/wasted?avatar=`,
};

// Função de proxy
async function sendOverlay(url, res) {
    try {
        const response = await axios.get(url, { responseType: "arraybuffer" });

        res.set({
            "Content-Type": "image/png",
            "Content-Disposition": "inline; filename=overlay.png",
        });

        return res.send(response.data);
    } catch (error) {
        return res.status(500).json({
            error: "Erro ao gerar overlay",
            detalhes: error.message
        });
    }
}

// Rotas dinâmicas
router.get("/:tipo", async (req, res) => {
    try {
        const { tipo } = req.params;
        const { avatar } = req.query;

        if (!overlays[tipo]) {
            return res.status(400).json({ 
                error: "Tipo de overlay inválido",
                disponiveis: Object.keys(overlays)
            });
        }

        if (!avatar) {
            return res.status(400).json({ 
                error: "Envie ?avatar=URL_DA_IMAGEM" 
            });
        }

        const finalURL = overlays[tipo] + encodeURIComponent(avatar);
        return sendOverlay(finalURL, res);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;