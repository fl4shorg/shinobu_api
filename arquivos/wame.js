const express = require("express");
const router = express.Router();

// Rota: /wame?numero=5599999999999&texto=Oi%20tudo%20bem
router.get("/", async (req, res) => {
  const numero = req.query.numero;
  const texto = req.query.texto || "";

  if (!numero) {
    return res.status(400).json({ error: "Parâmetro ?numero= obrigatório" });
  }

  try {
    // Remove caracteres inválidos (só números)
    const numeroLimpo = numero.replace(/\D/g, "");

    // Monta o link com ou sem texto
    const link = texto
      ? `https://wa.me/${numeroLimpo}?text=${encodeURIComponent(texto)}`
      : `https://wa.me/${numeroLimpo}`;

    res.json({
      numero: numeroLimpo,
      link
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao gerar link", details: err.message });
  }
});

module.exports = router;