const express = require("express");
const router = express.Router();
const translate = require("@vitalets/google-translate-api"); // biblioteca local

// Função genérica para traduzir
async function traduzir(texto, target) {
  try {
    const res = await translate(texto, { to: target || "pt" });
    return { status: true, resultado: res.text };
  } catch (err) {
    console.error("❌ Erro ao traduzir:", err.message);
    return { status: false, erro: "Erro ao traduzir o texto" };
  }
}

// GET: /tradutor?texto=hello&target=pt
router.get("/tradutor", async (req, res) => {
  const { texto, target } = req.query;
  if (!texto) return res.status(400).json({ status: false, erro: "Parâmetro 'texto' é obrigatório" });

  const data = await traduzir(texto, target);
  res.json(data);
});

// POST: /tradutor { texto: "hello", target: "pt" }
router.post("/tradutor", express.json(), async (req, res) => {
  const { texto, target } = req.body;
  if (!texto) return res.status(400).json({ status: false, erro: "Campo 'texto' é obrigatório" });

  const data = await traduzir(texto, target);
  res.json(data);
});

module.exports = router;