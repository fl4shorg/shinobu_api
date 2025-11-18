const express = require("express");
const axios = require("axios");
const router = express.Router();

// Função para limpar quebras de linha e tags HTML
function limparTexto(str) {
  if (!str) return null;
  return String(str)
    .replace(/<br\s*\/?>/gi, "\n")  // quebra de linha HTML → \n
    .replace(/<[^>]+>/g, "")        // remove todas as tags HTML
    .replace(/\r\n|\r|\n/g, " ")    // remove quebras de linha extras
    .replace(/\s+/g, " ")           // múltiplos espaços → 1 espaço
    .trim();
}

router.get("/", async (req, res) => {
  try {
    const search = req.query.search;

    if (!search) {
      return res.status(400).json({
        status: false,
        message: "Parâmetro ?search= está faltando"
      });
    }

    // 🔥 Pesquisa PT-BR
    const searchURL = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(
      search
    )}&l=brazilian&cc=br`;

    const pesquisa = await axios.get(searchURL);

    if (!pesquisa.data.items || pesquisa.data.items.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Nenhum jogo encontrado com esse nome"
      });
    }

    const jogo = pesquisa.data.items[0];

    // 🔥 Detalhes PT-BR
    const detalhesURL = `https://store.steampowered.com/api/appdetails?appids=${jogo.id}&l=brazilian`;

    const detalhes = await axios.get(detalhesURL);
    const gameId = String(jogo.id);
    const dados = detalhes.data[gameId];

    if (!dados || !dados.success) {
      return res.status(500).json({
        status: false,
        message: "Erro ao obter detalhes do jogo"
      });
    }

    const info = dados.data;

    const resultado = {
      status: true,
      id: jogo.id,
      nome: jogo.name,
      preco: info.price_overview?.final_formatted || "Gratuito",
      categorias: info.categories?.map(c => c.description) || [],
      generos: info.genres?.map(g => g.description) || [],
      website: info.website || null,
      descricao_curta: limparTexto(info.short_description),
      descricao: limparTexto(info.detailed_description),
      requisitos: limparTexto(info.pc_requirements?.minimum || "Não informado"),
      imagens: {
        header: info.header_image || null,
        background: info.background || null,
        capsules: info.capsule_image || null
      },
      desenvolvedores: info.developers || [],
      publicadoras: info.publishers || []
    };

    return res.json(resultado);

  } catch (err) {
    console.error("ERRO STEAM:", err);
    return res.status(500).json({
      status: false,
      message: "Erro interno no servidor"
    });
  }
});

module.exports = router;