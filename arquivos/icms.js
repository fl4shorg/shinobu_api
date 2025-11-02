const express = require("express");
const router = express.Router();

// Alíquotas de ICMS por estado
const aliquotasInternas = {
  "AC": 17, "AL": 18, "AP": 18, "AM": 18, "BA": 18, "CE": 18,
  "DF": 18, "ES": 17, "GO": 17, "MA": 18, "MT": 17, "MS": 17,
  "MG": 18, "PA": 17, "PB": 18, "PR": 18, "PE": 18, "PI": 18,
  "RJ": 20, "RN": 18, "RS": 18, "RO": 17, "RR": 17, "SC": 17,
  "SP": 18, "SE": 18, "TO": 18
};

// Função de cálculo
function calcularICMS(valorProduto, estado) {
  const aliquota = aliquotasInternas[estado.toUpperCase()];
  if (!aliquota) {
    const estadosDisponiveis = Object.keys(aliquotasInternas).join(", ");
    throw new Error(`Estado inválido. Estados disponíveis: ${estadosDisponiveis}`);
  }

  const icms = (valorProduto * aliquota) / 100;
  return {
    valorProduto: valorProduto.toFixed(2),
    estado: estado.toUpperCase(),
    aliquota,
    icms: icms.toFixed(2)
  };
}

// Rota GET para calcular ICMS
router.get("/calcular", (req, res) => {
  try {
    const valorProduto = parseFloat(req.query.valor);
    const estado = req.query.estado;

    if (!valorProduto || !estado) {
      return res.status(400).json({
        error: "Informe 'valor' e 'estado' na URL. Exemplo: /icms/calcular?valor=1024&estado=AC"
      });
    }

    const resultado = calcularICMS(valorProduto, estado);
    res.json(resultado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;