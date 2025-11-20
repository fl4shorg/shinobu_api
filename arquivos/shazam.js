const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function identificarMusica(caminhoArquivo) {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(caminhoArquivo));

    const resposta = await axios.post(
      "https://neextltda-shazam-api.hf.space/identify",
      form,
      { headers: form.getHeaders() }
    );

    return resposta.data;
  } catch (e) {
    console.log("❌ Erro ao identificar música:", e.message);
    return null;
  }
}

module.exports = { identificarMusica };