const express = require("express");
const axios = require("axios");
const router = express.Router();

const API_URL = "https://sandroapi.site/api/consulta";
const API_KEY = "SANDRO_PX2025";

// Função que chama a API original e limpa a resposta
async function fazerConsulta(tipo, query) {
  try {
    const res = await axios.post(API_URL, { tipo, entrada: query }, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
    });

    const data = res.data;

    // Limpa campos desnecessários
    const cleanData = {
      status: data.status || false,
      Requests: data.Requests || 0,
      resultado: data.resultado
        ? data.resultado.replace(/\\n/g, "\n")  // substitui quebras de linha duplicadas
                        .replace(/\\r/g, "")
                        .trim()
        : "[⚠️] NÃO ENCONTRADO! [⚠️]",
    };

    return cleanData;
  } catch (err) {
    console.error(`❌ Erro ao consultar ${tipo}:`, err.message);
    return { status: false, resultado: "[❌] Erro ao consultar API" };
  }
}

// 📞 Telefone
router.get("/consulta/telefone", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ erro: "Parâmetro 'query' é obrigatório" });
  const data = await fazerConsulta("telefone", query);
  res.json(data);
});

// 🧾 CPF
router.get("/consulta/cpf", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ erro: "Parâmetro 'query' é obrigatório" });
  const data = await fazerConsulta("cpf", query);
  res.json(data);
});

// 👤 Nome
router.get("/consulta/nome", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ erro: "Parâmetro 'query' é obrigatório" });
  const data = await fazerConsulta("nome", query);
  res.json(data);
});

// 🚗 Placa
router.get("/consulta/placa", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ erro: "Parâmetro 'query' é obrigatório" });
  const data = await fazerConsulta("placa", query);
  res.json(data);
});

module.exports = router;