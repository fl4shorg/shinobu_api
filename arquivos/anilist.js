// anilist.js - API de Personagens AniList 🏆
const express = require('express');
const axios = require('axios');
const translate = require('@vitalets/google-translate-api');

const router = express.Router();
const ANILIST_URL = 'https://graphql.anilist.co';

// Função para limpar texto
function limparTexto(str) {
  if (!str) return "Indisponível";
  return str.replace(/\s+/g, ' ').trim();
}

// Traduzir apenas a descrição do inglês para português
async function traduzirDescricao(eng) {
  if (!eng) return "Desconhecido";
  try {
    const res = await translate(eng, { to: 'pt' });
    return res.text.trim();
  } catch (err) {
    console.log('Erro na tradução:', err.message);
    return eng; // Retorna o texto original caso falhe
  }
}

// Rota GET /personagem?search=nome
router.get('/', async (req, res) => {
  try {
    const search = req.query.search;
    if (!search) return res.status(400).json({ status: 400, erro: '❌ O parâmetro "search" é obrigatório' });

    const query = `
      query ($search: String) {
        Character(search: $search) {
          name { full native alternative }
          image { large medium }
          description
          age
          gender
          bloodType
          dateOfBirth { year month day }
          favourites
          media(perPage: 5, sort: POPULARITY_DESC) {
            nodes {
              title { romaji english native }
              coverImage { large medium }
              type
              format
              startDate { year month day }
              endDate { year month day }
              status
            }
          }
        }
      }
    `;

    const variables = { search };
    const { data } = await axios.post(
      ANILIST_URL,
      { query, variables },
      { headers: { 'Content-Type': 'application/json' }, timeout: 20000 }
    );

    const char = data.data.Character;
    if (!char) return res.status(404).json({ status: 404, erro: '❌ Personagem não encontrado' });

    // Traduz apenas a descrição
    const descricaoTraduzida = await traduzirDescricao(limparTexto(char.description));

    const response = {
      status: 200,
      personagem: {
        "📛 Nome Completo": char.name.full || "Desconhecido",
        "🈶 Nome Nativo": char.name.native || "Desconhecido",
        "📝 Nomes Alternativos": char.name.alternative || [],
        "🖼️ Imagens": {
          "🖼️ Grande": char.image.large || "",
          "🖼️ Média": char.image.medium || ""
        },
        "📝 Descrição": descricaoTraduzida || "Descrição indisponível",
        "🎂 Idade": char.age || "Desconhecida",
        "👤 Gênero": char.gender || "Desconhecido",
        "🩸 Tipo Sanguíneo": char.bloodType || "Desconhecido",
        "📅 Aniversário": {
          ano: char.dateOfBirth?.year || null,
          mês: char.dateOfBirth?.month || null,
          dia: char.dateOfBirth?.day || null
        },
        "❤️ Favoritos": char.favourites || 0,
        "🎬 Mídias Populares": char.media.nodes.map(m => ({
          "📌 Título Romaji": m.title.romaji || "Desconhecido",
          "📌 Título Inglês": m.title.english || "Desconhecido",
          "📌 Título Nativo": m.title.native || "Desconhecido",
          "🖼️ Imagem": {
            "🖼️ Grande": m.coverImage.large || "",
            "🖼️ Média": m.coverImage.medium || ""
          },
          "🎭 Tipo": m.type || "Desconhecido",
          "📺 Formato": m.format || "Desconhecido",
          "📅 Início": {
            ano: m.startDate?.year || null,
            mês: m.startDate?.month || null,
            dia: m.startDate?.day || null
          },
          "📅 Fim": {
            ano: m.endDate?.year || null,
            mês: m.endDate?.month || null,
            dia: m.endDate?.day || null
          },
          "📊 Status": m.status || "Desconhecido"
        }))
      }
    };

    return res.json(response);

  } catch (err) {
    return res.status(500).json({ status: 500, erro: `⚠️ ${err.message}` });
  }
});

module.exports = router;