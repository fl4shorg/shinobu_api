const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {
    // Pega os parâmetros enviados pela URL
    const { nome, idade, numero, Instagram, email } = req.query;

    if (!nome || !idade || !numero || !Instagram || !email) {
      return res.status(400).json({
        status: "error",
        message: "Parâmetros faltando. Envie nome, idade, numero, Instagram e email."
      });
    }

    // Monta a URL destino
    const finalUrl =
      "https://script.google.com/macros/s/AKfycbwUNLJrprrMjpWUfX8G35h41gEKI61GwL-O55HAaoNGneNzYTi8n8vqW3LyyM1Oqc5qcA/exec" +
      `?action=create` +
      `&nome=${encodeURIComponent(nome)}` +
      `&idade=${encodeURIComponent(idade)}` +
      `&numero=${encodeURIComponent(numero)}` +
      `&Instagram=${encodeURIComponent(Instagram)}` +
      `&email=${encodeURIComponent(email)}`;

    // Faz a requisição ao Google Script
    const response = await axios.get(finalUrl);

    // Envia para o usuário exatamente o que o script responder
    return res.json(response.data);

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Erro ao consultar API externa",
      detail: err.message
    });
  }
});

module.exports = router;