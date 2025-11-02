const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

router.get("/", async (req, res) => {
    const signo = req.query.q;
    if (!signo) return res.status(400).json({ error: "Parâmetro ?q= obrigatório" });

    const mapSignos = {
        "aries": "Áries",
        "touro": "Touro",
        "gemeos": "Gêmeos",
        "cancer": "Câncer",
        "leao": "Leão",
        "virgem": "Virgem",
        "libra": "Libra",
        "escorpiao": "Escorpião",
        "sagitario": "Sagitário",
        "capricornio": "Capricórnio",
        "aquario": "Aquário",
        "peixes": "Peixes"
    };

    const signoURL = mapSignos[signo.toLowerCase()];
    if (!signoURL) return res.status(400).json({ error: "Signo inválido" });

    const url = `https://wiki.deldebbio.com.br/index.php/${encodeURIComponent(signoURL + "_(astrologia)")}`;

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Captura a segunda imagem do signo
        let imgEl = $('img.mw-file-element').eq(1); // segunda imagem
        let imagem = null;
        if (imgEl.length) {
            let src = imgEl.attr('src'); 
            if (src) {
                const match = src.match(/\/thumb\/(.+?)\/.+$/);
                if (match && match[1]) {
                    imagem = 'https://wiki.deldebbio.com.br/images/' + match[1].split('/').pop();
                } else {
                    imagem = 'https://wiki.deldebbio.com.br' + src;
                }
            }
        }

        // Captura descrição
        const descricaoSpan = $('span#Descrição');
        if (!descricaoSpan.length) return res.status(404).json({ error: "Descrição não encontrada" });

        let descricao = "";
        let el = descricaoSpan.parent().next();
        while (el.length && el[0].tagName !== "h2" && el[0].tagName !== "h3") {
            if (el[0].tagName === "p") {
                descricao += el.text().trim() + " "; // texto contínuo, sem n/n
            }
            el = el.next();
        }

        descricao = descricao.replace(/\s+/g, ' ').trim(); // remove espaços extras

        // Retorna imagem separada da descrição
        res.json({
            signo: signoURL,
            imagem,
            descricao
        });

    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar signo", details: err.message });
    }
});

module.exports = router;