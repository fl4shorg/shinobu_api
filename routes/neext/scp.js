const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// Caminho pro scp.json
const scpPath = path.join(__dirname, "scp.json");

// Rota principal: retorna o conteúdo do JSON
router.get("/", (req, res) => {
  try {
    const data = fs.readFileSync(scpPath, "utf8");
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  } catch (err) {
    res.status(500).json({ error: "Erro ao ler o arquivo SCP." });
  }
});

// Opcional: rota pra buscar por nome específico
router.get("/:nome", (req, res) => {
  try {
    const data = fs.readFileSync(scpPath, "utf8");
    const jsonData = JSON.parse(data);
    const item = jsonData.find(i => i.nome.toLowerCase() === req.params.nome.toLowerCase());

    if (!item) {
      return res.status(404).json({ error: "SCP não encontrado." });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Erro ao ler o arquivo SCP." });
  }
});

module.exports = router;