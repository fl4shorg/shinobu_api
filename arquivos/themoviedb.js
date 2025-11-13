const express = require('express');
const axios = require('axios');

const router = express.Router();

const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzY2Y1MDU5ZDY4OTM1NTJkNmY1NmIxMmIwZGY1MGQ2YiIsIm5iZiI6MTc2Mjk3MzA4OC4zNjgsInN1YiI6IjY5MTRkNWEwNzQwOTMwN2ZjNTNhYWE0ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.cDGQWaBKJI22WJM-9xWMi9dloMybcjrdAvRhst8wuis';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// 🔍 Buscar séries pelo nome
router.get('/search', async (req, res) => {
  try {
    const name = req.query.name;
    if (!name) return res.status(400).json({ error: 'Parâmetro "name" é obrigatório.' });

    const { data } = await axios.get('https://api.themoviedb.org/3/search/tv', {
      params: { query: name, language: 'pt-BR', page: 1 },
      headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
    });

    const results = (data.results || []).map(s => ({
      id: s.id,
      name: s.name,
      originalName: s.original_name,
      overview: s.overview,
      firstAirDate: s.first_air_date,
      language: s.original_language,
      popularity: s.popularity,
      voteAverage: s.vote_average,
      voteCount: s.vote_count,
      poster: s.poster_path ? `${IMAGE_BASE}${s.poster_path}` : null,
      backdrop: s.backdrop_path ? `${IMAGE_BASE}${s.backdrop_path}` : null
    }));

    res.json({ total: results.length, results });
  } catch (err) {
    res.status(500).json({ error: 'Falha ao buscar séries', details: err.message });
  }
});

// 📺 Top 10 populares
router.get('/top10/popular', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.themoviedb.org/3/tv/popular', {
      params: { language: 'pt-BR', page: 1 },
      headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
    });

    const top10 = (data.results || []).slice(0, 10).map(s => ({
      id: s.id,
      name: s.name,
      originalName: s.original_name,
      overview: s.overview,
      firstAirDate: s.first_air_date,
      language: s.original_language,
      popularity: s.popularity,
      voteAverage: s.vote_average,
      voteCount: s.vote_count,
      poster: s.poster_path ? `${IMAGE_BASE}${s.poster_path}` : null,
      backdrop: s.backdrop_path ? `${IMAGE_BASE}${s.backdrop_path}` : null
    }));

    res.json({ top10 });
  } catch (err) {
    res.status(500).json({ error: 'Falha ao buscar top 10 séries populares', details: err.message });
  }
});

// 🏆 Top 10 melhor avaliadas
router.get('/top10/top_rated', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.themoviedb.org/3/tv/top_rated', {
      params: { language: 'pt-BR', page: 1 },
      headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
    });

    const top10 = (data.results || []).slice(0, 10).map(s => ({
      id: s.id,
      name: s.name,
      originalName: s.original_name,
      overview: s.overview,
      firstAirDate: s.first_air_date,
      language: s.original_language,
      popularity: s.popularity,
      voteAverage: s.vote_average,
      voteCount: s.vote_count,
      poster: s.poster_path ? `${IMAGE_BASE}${s.poster_path}` : null,
      backdrop: s.backdrop_path ? `${IMAGE_BASE}${s.backdrop_path}` : null
    }));

    res.json({ top10 });
  } catch (err) {
    res.status(500).json({ error: 'Falha ao buscar top 10 séries top rated', details: err.message });
  }
});

module.exports = router;