const express = require("express");
const axios = require("axios");
const router = express.Router();

// Lista de efeitos suportados
const efeitosDisponiveis = [
  "fluffy-logo",
  "lava-logo",
  "cool-logo",
  "comic-logo",
  "fire-logo",
  "water-logo",
  "ice-logo",
  "elegant-logo",
  "gold-logo",
  "fortune-logo",
  "blue-logo",
  "silver-logo",
  "neon-logo",
  "skate-logo",
  "retro-logo",
  "candy-logo",
  "glossy-logo"
];

// Rota: /flamingtext/:efeito?nome=Flash
router.get("/flamingtext/:efeito", async (req, res) => {
  const { efeito } = req.params;
  const { nome } = req.query;

  if (!nome) {
    return res.status(400).json({
      status: false,
      erro: "Parâmetro obrigatório: nome",
      exemplo: "/flamingtext/fluffy-logo?nome=Flash"
    });
  }

  if (!efeitosDisponiveis.includes(efeito)) {
    return res.status(400).json({
      status: false,
      erro: "Efeito inválido",
      efeitosDisponiveis
    });
  }

  const url = `https://flamingtext.com/net-fu/proxy_form.cgi?script=${efeito}&text=${encodeURIComponent(nome)}&imageoutput=true&output=dir`;

  try {
    const response = await axios.get(url, { responseType: "stream" });
    res.setHeader("Content-Type", "image/png");
    response.data.pipe(res);
  } catch (err) {
    console.error("❌ Erro ao gerar imagem:", err.message);
    res.status(500).json({ status: false, erro: "Erro ao gerar imagem" });
  }
});

module.exports = router;