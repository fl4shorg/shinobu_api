const express = require("express");
const axios = require("axios");

const router = express.Router();

const CPF_API = "https://cpfgenerator.org/api/cpf/generator";
const DEFAULT_QUANT = 1;
const DEFAULT_FORMAT = true;
const CRIADOR = "© neext ltda"; // altere se quiser

// Função que chama a API externa
async function gerarCPF(quant = DEFAULT_QUANT, format = DEFAULT_FORMAT) {
  const body = {
    quant: Number(quant),
    format: format === "false" || format === false ? false : true
  };

  const resp = await axios.post(CPF_API, body, {
    headers: {
      "Content-Type": "application/json"
    },
    timeout: 15000
  });

  // A API normalmente retorna um array de cpfs em resp.data
  return resp.data;
}

// GET /cpf?quant=2&format=true
router.get("/", async (req, res) => {
  const { quant = DEFAULT_QUANT, format = DEFAULT_FORMAT } = req.query;

  try {
    const dados = await gerarCPF(quant, format);
    res.json({
      status: 200,
      criador: CRIADOR,
      resultado: Array.isArray(dados) ? dados : [dados]
    });
  } catch (err) {
    res.status(500).json({
      error: "Erro ao gerar CPF",
      details: err.response?.data || err.message || String(err)
    });
  }
});

// POST /cpf  (body: { quant: number, format: boolean })
router.post("/", async (req, res) => {
  const { quant = DEFAULT_QUANT, format = DEFAULT_FORMAT } = req.body || {};

  try {
    const dados = await gerarCPF(quant, format);
    res.json({
      status: 200,
      criador: CRIADOR,
      resultado: Array.isArray(dados) ? dados : [dados]
    });
  } catch (err) {
    res.status(500).json({
      error: "Erro ao gerar CPF",
      details: err.response?.data || err.message || String(err)
    });
  }
});

module.exports = router;