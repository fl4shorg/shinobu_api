const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');

const router = express.Router();
const upload = multer(); // recebe arquivos em buffer

class CatboxUploader {
    constructor(isDebug = false) {
        this.isDebug = isDebug;
        this.API_URL = 'https://catbox.moe/user/api.php';
    }

    log = (text) => { if (this.isDebug) console.log('[CatboxUploader]', text); }

    uploadBuffer = async (buffer, fileName) => {
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('userhash', '');
        form.append('fileToUpload', buffer, { filename: fileName });

        try {
            const response = await axios.post(this.API_URL, form, {
                headers: form.getHeaders(),
                maxBodyLength: Infinity
            });

            this.log('Resposta Catbox: ' + response.data);

            if (!response.data.startsWith('http'))
                throw new Error('Upload falhou: ' + response.data);

            return response.data;
        } catch (error) {
            throw new Error('Erro ao enviar para Catbox: ' + error.message);
        }
    }
}

const catbox = new CatboxUploader(true);

// ROTA FINAL
router.post("/", upload.single("file"), async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: "Nenhum arquivo enviado." });

        // base64
        const base64 = req.file.buffer.toString("base64");

        // upload catbox
        const url = await catbox.uploadBuffer(req.file.buffer, req.file.originalname);

        return res.json({
            status: true,
            url,
            base64
        });

    } catch (err) {
        console.error("Erro:", err.message);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;