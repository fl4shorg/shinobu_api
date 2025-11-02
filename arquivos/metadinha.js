const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Função genérica para enviar um par aleatório de uma metadinha
function sendRandomPair(res, filename) {
  try {
    // Caminho absoluto da pasta amor (fora de 'arquivos')
    const filePath = path.join(__dirname, "..", "amor", filename);

    if (!fs.existsSync(filePath)) {
      console.error("Arquivo não encontrado:", filePath);
      return res.status(404).json({ success: false, message: "Metadinha não encontrada." });
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    let data;
    try {
      data = JSON.parse(rawData);
    } catch (err) {
      console.error("Erro ao parsear JSON:", filePath, err);
      return res.status(500).json({ success: false, message: "Erro ao ler a metadinha." });
    }

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({ success: false, message: "Nenhuma metadinha encontrada." });
    }

    // Escolhe um par aleatório
    const randomPair = data[Math.floor(Math.random() * data.length)];
    return res.json({ success: true, pair: randomPair });
  } catch (err) {
    console.error("Erro inesperado:", err);
    return res.status(500).json({ success: false, message: "Erro interno no servidor." });
  }
}

// Rotas de metadinhas
router.get("/dexter", (req, res) => sendRandomPair(res, "metadinhadexter.json"));
router.get("/homemaranha", (req, res) => sendRandomPair(res, "metadinhahomemaranha.json"));
router.get("/diariodeumvampiro", (req, res) => sendRandomPair(res, "metadinhediariodeumvampiro.json"));
router.get("/lacasadepapel", (req, res) => sendRandomPair(res, "metadinhalacasadepapel.json"));
router.get("/you", (req, res) => sendRandomPair(res, "metadinhayou.json"));
router.get("/shrek", (req, res) => sendRandomPair(res, "metadinhashrek.json"));

module.exports = router;