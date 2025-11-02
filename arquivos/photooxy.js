const express = require("express");
const fetch = require("node-fetch");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();

// Função para pegar buffer da imagem
async function getBuffer(url) {
    const res = await axios.get(url, { responseType: "arraybuffer" });
    return res.data;
}

// Função principal para gerar imagem
async function generatePhoto(effectUrl, texts) {
    if (typeof texts === "string") texts = [texts];

    // Preparar dados do formulário
    const form = new FormData();
    texts.forEach(t => form.append("text[]", t));
    form.append("submit", "Go");

    // O build_server padrão do Photooxy
    form.append("build_server", "https://e2.yotools.net");
    form.append("build_server_id", 2);

    // Enviar POST para gerar token/JSON da imagem
    const postRes = await fetch(effectUrl, {
        method: "POST",
        headers: { ...form.getHeaders() },
        body: form.getBuffer()
    });

    const html = await postRes.text();

    // O token JSON geralmente vem dentro de um <script> no HTML
    const match = html.match(/var _form_value = (\{.*\});/);
    if (!match) throw new Error("Token/JSON da imagem não encontrado!");

    const data = JSON.parse(match[1]);

    // POST final para gerar imagem
    const resJson = await fetch(`https://photooxy.com/effect/create-image?text=${encodeURIComponent(JSON.stringify(data))}`);
    const result = await resJson.json();

    const imageUrl = `https://e2.yotools.net/${result.image}`;
    const buffer = await getBuffer(imageUrl);

    return buffer;
}

// Rota Express
router.get("/", async (req, res) => {
    try {
        const { url, text } = req.query;
        if (!url || !text) return res.status(400).send("Faltando parâmetros: url ou text");

        const imageBuffer = await generatePhoto(url, text);
        res.set("Content-Type", "image/png");
        res.send(imageBuffer);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;