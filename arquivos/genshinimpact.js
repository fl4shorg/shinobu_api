const express = require("express");
const axios = require("axios");
const translateModule = require("@vitalets/google-translate-api"); // CommonJS
const translate = translateModule.default || translateModule; // garante compatibilidade

const app = express();
app.use(express.json());

app.get("/:name", async (req, res) => {
  try {
    const { name } = req.params;

    const response = await axios.get(
      `https://genshin-db-api.vercel.app/api/v5/characters?query=${encodeURIComponent(name)}`
    );

    const data = response.data;

    if (!data) return res.status(404).json({ status: false, message: "Personagem não encontrado" });

    // Traduz apenas a description
    if (data.description) {
      try {
        const translatedDescription = await translate(data.description, { to: "pt" });
        data.description = translatedDescription.text;
      } catch (err) {
        console.error("Erro ao traduzir description:", err.message);
      }
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Erro ao buscar personagem", error: err.message });
  }
});

module.exports = app;