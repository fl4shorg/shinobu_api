const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');

const router = express.Router();
const upload = multer(); // recebe arquivos em memória

class CatboxUploader {
    constructor(isDebug = false) {
        this.isDebug = isDebug;
        this.API_URL = 'https://catbox.moe/user/api.php';
    }

    log = (text) => { if (this.isDebug) console.log('[CatboxUploader]', text); }

    /**
     * Envia buffer normal para o Catbox
     */
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

            if (!response.data.startsWith('http')) throw new Error('Upload falhou: ' + response.data);
            return response.data;
        } catch (error) {
            throw new Error('Erro ao enviar para Catbox: ' + error.message);
        }
    }

    /**
     * Recebe Base64 -> Converte para buffer -> Envia
     */
    uploadBase64 = async (base64, fileName = "image.png") => {
        const buffer = Buffer.from(base64, "base64");
        return await this.uploadBuffer(buffer, fileName);
    }
}

const catbox = new CatboxUploader(true);

/**
 * 🔥 ROTA FINAL:
 * Recebe um arquivo em multipart → converte → envia
 * Funciona no Vercel!
 */
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: 'Arquivo não enviado' });

        // converter buffer para Base64
        const base64 = req.file.buffer.toString("base64");

        // enviar para o Catbox usando base64
        const link = await catbox.uploadBase64(base64, req.file.originalname);

        res.json({ url: link });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;