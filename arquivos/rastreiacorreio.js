const express = require("express");
const router = express.Router();
const axios = require("axios");

const API_URL = "https://api-labs.wonca.com.br/wonca.labs.v1.LabsService/Track";
// Sua chave diretamente no código para teste local
const API_KEY = "OTemv0NgjS40L2RfAfk045RcYTzVFIHDCDJ5pDw-AGE";

/**
 * Função para chamar a API Wonca Labs
 * @param {string} code - Código de rastreio
 */
async function rastrearCodigo(code) {
  try {
    const resp = await axios.post(API_URL, { code }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Apikey ${API_KEY}`
      },
      timeout: 15000
    });

    return { success: true, data: resp.data };
  } catch (err) {
    if (err.response && err.response.data) {
      return { success: false, data: err.response.data };
    } else {
      return { success: false, error: err.message };
    }
  }
}

// Rota GET: /rastreio?code=AA361812099BR
router.get("/", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ error: "Informe o parâmetro 'code' na URL. Ex: /rastreio?code=AA361812099BR" });
  }

  const resultado = await rastrearCodigo(code);

  if (!resultado.success) {
    // Se não encontrou rastreio, envia mensagem simples sem detalhes
    if (resultado.data && (resultado.data.code === "not_found" || (resultado.data.message && resultado.data.message.includes("not_found")))) {
      return res.status(404).json({ error: "Rastreamento não encontrado" });
    } else {
      return res.status(500).json({ error: resultado.error || "Erro interno na API" });
    }
  }

  res.json(resultado.data);
});

module.exports = router;