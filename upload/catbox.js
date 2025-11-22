const express = require("express");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();

class CatboxUploader {
  constructor(isDebug = false) {
    this.isDebug = isDebug;
    this.API_URL = "https://catbox.moe/user/api.php";
  }

  log(msg) {
    if (this.isDebug) console.log("[CatboxUploader]", msg);
  }

  async uploadBuffer(buffer, fileName) {
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", buffer, { filename: fileName });

    try {
      const res = await axios.post(this.API_URL, form, {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
      });

      if (!res.data.startsWith("http")) {
        throw new Error("Upload falhou: " + res.data);
      }

      return res.data;
    } catch (err) {
      throw new Error("Erro no Catbox: " + err.message);
    }
  }
}

const catbox = new CatboxUploader(true);

// Agora recebe Base64
router.post("/", async (req, res) => {
  try {
    const { base64, filename } = req.body;

    if (!base64) {
      return res.status(400).json({ error: "Envie 'base64' no body" });
    }

    const buffer = Buffer.from(base64, "base64");

    const link = await catbox.uploadBuffer(
      buffer,
      filename || "imagem.jpg"
    );

    res.json({ url: link });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;