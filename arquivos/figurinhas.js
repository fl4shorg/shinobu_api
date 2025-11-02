// arquivos/figurinhas.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Mapeamento das categorias com a quantidade total de figurinhas
const categorias = {
  anime: 177,
  coreana: 43,
  desenho: 186,
  emoji: 99,
  engracadas: 25,
  meme: 99,
  raiva: 29,
  roblox: 20
};

// Função que retorna um número aleatório entre 1 e max (inclusive)
function randomInt(max) {
  return Math.floor(Math.random() * max) + 1;
}

// Função que cria rota GET para cada categoria
Object.keys(categorias).forEach(cat => {
  router.get(`/${cat}`, (req, res) => {
    const total = categorias[cat];
    const numero = randomInt(total);

    // Caminho completo da figurinha
    const filePath = path.join(__dirname, '..', 'figurinhas', `figurinha-${cat}`, `${numero}.webp`);
    
    // Verifica se existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `Figurinha não encontrada: ${filePath}` });
    }

    // Retorna o arquivo
    res.sendFile(filePath, err => {
      if (err) {
        res.status(500).json({ error: 'Erro ao enviar a figurinha.' });
      }
    });
  });
});

module.exports = router;