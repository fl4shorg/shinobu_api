const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const formidable = require("formidable");

module.exports.config = {
  api: {
    bodyParser: false, // obrigatório para upload no Vercel
  },
};

module.exports.default = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido." });
  }

  try {
    // 1. Parse do upload (sem salvar o arquivo no disco do vercel)
    const form = new formidable.IncomingForm({
      keepExtensions: true,
      maxFileSize: 20 * 1024 * 1024, // 20MB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(400).json({ erro: "Erro ao processar arquivo." });

      const file = files.file;
      if (!file) return res.status(400).json({ erro: "Envie um arquivo no campo 'file'." });

      // 2. Upload para Catbox
      const catForm = new FormData();
      catForm.append("reqtype", "fileupload");
      catForm.append("fileToUpload", fs.createReadStream(file.filepath));

      const catResp = await axios.post("https://catbox.moe/user/api.php", catForm, {
        headers: catForm.getHeaders(),
      });

      const fileUrl = catResp.data; // link final
      console.log("Arquivo no Catbox:", fileUrl);

      // 3. Baixar o arquivo do Catbox (stream)
      const download = await axios.get(fileUrl, {
        responseType: "arraybuffer", // precisa do buffer real
      });

      const audioBuffer = Buffer.from(download.data);

      // 4. Enviar o áudio para a API do HuggingFace
      const hfForm = new FormData();
      hfForm.append("file", audioBuffer, {
        filename: "audio.mp3",
        contentType: "audio/mpeg",
      });

      const hfResp = await axios.post(
        "https://neextltda-shazam-api.hf.space/identify",
        hfForm,
        { headers: hfForm.getHeaders() }
      );

      // 5. Retorno final
      return res.status(200).json({
        status: true,
        arquivo_catbox: fileUrl,
        resultado: hfResp.data,
      });
    });

  } catch (e) {
    console.log("ERRO:", e);
    return res.status(500).json({ erro: "Erro interno." });
  }
};