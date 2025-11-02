const express = require("express");
const axios = require("axios");
const translate = require("@vitalets/google-translate-api");

const router = express.Router();

// Função para traduzir texto para português
async function traduzir(texto) {
  try {
    const res = await translate(texto, { to: "pt" });
    return res.text;
  } catch (err) {
    console.error("Erro ao traduzir:", err.message);
    return texto; // Retorna o original se falhar
  }
}

// Rota: /noaccuweather?cidade=São Paulo
router.get("/", async (req, res) => {
  const cidade = req.query.cidade;
  if (!cidade) return res.status(400).json({ error: "Parâmetro ?cidade= obrigatório" });

  try {
    const response = await axios.get(`https://wttr.in/${encodeURIComponent(cidade)}?format=j1`);
    const data = response.data;

    // Traduzir clima atual
    const descricaoAtual = await traduzir(data.current_condition[0].weatherDesc[0].value);

    const climaAtual = {
      temperatura: data.current_condition[0].temp_C + "°C",
      descricao: descricaoAtual,
      umidade: data.current_condition[0].humidity + "%",
      vento: data.current_condition[0].windspeedKmph + " km/h",
    };

    // Traduzir previsão dos próximos 3 dias
    const previsao3Dias = await Promise.all(
      data.weather.map(async (d) => ({
        data: d.date,
        minima: d.mintempC + "°C",
        maxima: d.maxtempC + "°C",
        descricao: await traduzir(d.hourly[4].weatherDesc[0].value), // horário médio do dia
      }))
    );

    res.json({
      cidade,
      clima_atual: climaAtual,
      previsao_3_dias: previsao3Dias
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar clima", details: err.message });
  }
});

module.exports = router;