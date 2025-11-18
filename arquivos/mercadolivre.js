// arquivos/mercadolivre.js
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const router = express.Router();

// Função para remover acentos
function removerAcentos(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Função para limpar espaços extras e quebras de linha
function limparTexto(str) {
  if (!str) return "";
  return String(str)
    .replace(/\s+/g, " ")
    .trim();
}

// Função principal de pesquisa no Mercado Livre
const MercadoLivreSearch = (q) => new Promise(async (resolve, reject) => {
  try {
    const response = await axios.get(`https://lista.mercadolivre.com.br/${removerAcentos(q)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const $ = cheerio.load(response.data);
    const dados = [];

    $('li.ui-search-layout__item').each((i, e) => {
      const produto = limparTexto($(e).find('h2.ui-search-item__title').text());
      const imagem = $(e).find('img.ui-search-result-image__element').attr('data-src') 
                     || $(e).find('img.ui-search-result-image__element').attr('src');
      const precoInteiro = $(e).find('span.price-tag-fraction').text()?.trim();
      const precoDecimal = $(e).find('span.price-tag-cents').text()?.trim();
      const valor = precoInteiro ? `R$ ${precoInteiro}${precoDecimal ? ',' + precoDecimal : ''}` : null;
      const link = $(e).find('a.ui-search-link').attr('href');

      if (produto && imagem && valor && link) {
        dados.push({ produto, imagem, valor, link });
      }
    });

    resolve({
      status: 200,
      criador: "SeuNomeAqui",
      resultado: dados
    });

  } catch (err) {
    reject(err);
  }
});

// Rota GET /mercadolivre?search=...
router.get("/", async (req, res) => {
  const search = req.query.search;
  if (!search) return res.status(400).json({ status: false, message: "Parâmetro ?search= está faltando" });

  try {
    const resultado = await MercadoLivreSearch(search);
    res.json(resultado);
  } catch (err) {
    console.error("Erro Mercado Livre:", err);
    res.status(500).json({ status: false, message: "Erro interno no servidor" });
  }
});

module.exports = router;