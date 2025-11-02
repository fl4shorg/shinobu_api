const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

// Rota: /amazon?q=iphone
router.get("/", async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Faltou o parâmetro ?q=" });

    const url = `https://www.amazon.com.br/s?k=${encodeURIComponent(query)}`;

    try {
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8"
            }
        });

        const $ = cheerio.load(data);
        const produtos = [];

        $(".s-main-slot .s-result-item").each((_, el) => {
            const $el = $(el);

            const titulo = $el.find("h2 span").text().trim();
            const imagem =
                $el.find("img.s-image").attr("src") ||
                $el.find("img.s-image").attr("data-src");
            const link = "https://www.amazon.com.br" + ($el.find("a.a-link-normal").attr("href") || "");

            // Pega o preço formatado
            let preco = $el.find(".a-price .a-offscreen").first().text().trim();

            if (!preco) {
                const whole = $el.find(".a-price .a-price-whole").first().text().trim();
                const fraction = $el.find(".a-price .a-price-fraction").first().text().trim();
                if (whole) preco = `R$ ${whole}${fraction ? "," + fraction : ""}`;
            }

            // Pega a avaliação
            const avaliacao = $el.find(".a-icon-alt").first().text().trim() || null;

            if (titulo && imagem && link) {
                produtos.push({
                    titulo,
                    preco: preco || "Indisponível",
                    avaliacao,
                    imagem,
                    link
                });
            }
        });

        if (produtos.length === 0) {
            return res.status(404).json({ error: "Nenhum produto encontrado." });
        }

        res.json({
            status: 200,
            resultados: produtos.slice(0, 10)
        });
    } catch (err) {
        res.status(500).json({
            error: "Erro ao buscar produtos na Amazon",
            details: err.message
        });
    }
});

module.exports = router;