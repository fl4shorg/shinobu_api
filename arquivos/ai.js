const express = require('express');
const WebSocket = require('ws');
const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

/* ---------------------- COPILOT ---------------------- */
class Copilot {
    constructor() {
        this.conversationId = null;
        this.models = { default: 'chat', 'think-deeper': 'reasoning', 'gpt-5': 'smart' };
        this.headers = {
            origin: 'https://copilot.microsoft.com',
            'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
        };
    }

    async createConversation() {
        const { data } = await axios.post('https://copilot.microsoft.com/c/api/conversations', null, { headers: this.headers });
        this.conversationId = data.id;
        return this.conversationId;
    }

    async chat(message, { model = 'default' } = {}) {
        if (!this.conversationId) await this.createConversation();
        if (!this.models[model]) throw new Error(`Available models: ${Object.keys(this.models).join(', ')}`);

        return new Promise((resolve, reject) => {
            const ws = new WebSocket(
                `wss://copilot.microsoft.com/c/api/chat?api-version=2&features=-,ncedge,edgepagecontext&setflight=-,ncedge,edgepagecontext&ncedge=1`,
                { headers: this.headers }
            );

            const response = { text: '', citations: [] };

            ws.on('open', () => {
                ws.send(JSON.stringify({ event: 'setOptions', supportedFeatures: ['partial-generated-images'] }));
                ws.send(JSON.stringify({
                    event: 'send',
                    mode: this.models[model],
                    conversationId: this.conversationId,
                    content: [{ type: 'text', text: message }],
                    context: {}
                }));
            });

            ws.on('message', (chunk) => {
                try {
                    const parsed = JSON.parse(chunk.toString());
                    switch (parsed.event) {
                        case 'appendText': response.text += parsed.text || ''; break;
                        case 'citation': response.citations.push({ title: parsed.title, icon: parsed.iconUrl, url: parsed.url }); break;
                        case 'done': resolve(response); ws.close(); break;
                        case 'error': reject(new Error(parsed.message)); ws.close(); break;
                    }
                } catch (err) { reject(err); }
            });

            ws.on('error', reject);
        });
    }
}

const copilot = new Copilot();
router.get('/copilot', async (req, res) => {
    try {
        const { message, model } = req.query;
        if (!message) return res.status(400).json({ error: 'Parâmetro "message" é obrigatório.' });
        const reply = await copilot.chat(message, { model });
        res.json(reply);
    } catch (err) { res.status(500).json({ error: err.message }); }
});


/* ---------------------- QWEN ---------------------- */
const { randomUUID } = require('crypto');
const qwenAxios = axios.create({
    baseURL: 'https://chat.qwen.ai/api',
    headers: {
        'Bx-V': '2.5.31',
        'Connection': 'keep-alive',
        'Host': 'chat.qwen.ai',
        'Origin': 'https://chat.qwen.ai',
        'Referer': 'https://chat.qwen.ai/',
        'User-Agent': 'Mozilla/5.0',
        'Version': '0.0.230',
        'X-Request-Id': randomUUID()
    }
});

router.get('/qwen', async (req, res) => {
    try {
        const { prompt } = req.query;
        if (!prompt) return res.status(400).json({ error: 'Parâmetro "prompt" é obrigatório.' });

        // Para simplificar, apenas retornando prompt + modelo fixo como demo
        // Ideal: implementar login/token Qwen
        res.json({ reply: `Qwen respondeu: ${prompt}` });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


/* ---------------------- DEEPFAKEMAKER ---------------------- */
class AuthGenerator {
    static #PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDa2oPxMZe71V4dw2r8rHWt59gH\nW5INRmlhepe6GUanrHykqKdlIB4kcJiu8dHC/FJeppOXVoKz82pvwZCmSUrF/1yr\nrnmUDjqUefDu8myjhcbio6CnG5TtQfwN2pz3g6yHkLgp8cFfyPSWwyOCMMMsTU9s\nsnOjvdDb4wiZI8x3UwIDAQAB\n-----END PUBLIC KEY-----`;
    static #S = 'NHGNy5YFz7HeFb';
    constructor(appId) { this.appId = appId; }
    aesEncrypt(data, key, iv) {
        const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(key), Buffer.from(iv));
        let encrypted = cipher.update(data, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    }
    generateRandomString(len) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const randomBytes = crypto.randomBytes(len);
        for (let i = 0; i < len; i++) result += chars[randomBytes[i] % chars.length];
        return result;
    }
    generate() {
        const t = Math.floor(Date.now() / 1000).toString();
        const nonce = uuidv4();
        const tempAesKey = this.generateRandomString(16);
        const encryptedData = crypto.publicEncrypt({ key: AuthGenerator.#PUBLIC_KEY, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(tempAesKey));
        const secret_key = encryptedData.toString('base64');
        const sign = this.aesEncrypt(`${this.appId}:${AuthGenerator.#S}:${t}:${nonce}:${secret_key}`, tempAesKey, tempAesKey);
        return { app_id: this.appId, t, nonce, sign, secret_key };
    }
}

router.post('/deepfake', async (req, res) => {
    try {
        if (!req.files || !req.files.image) return res.status(400).json({ error: 'Imagem obrigatória.' });
        if (!req.body.prompt) return res.status(400).json({ error: 'Prompt obrigatório.' });

        const buffer = req.files.image.data;
        const prompt = req.body.prompt;
        // Aqui você pode chamar a função convert (DeepFakemaker)
        res.json({ reply: `DeepFakemaker recebeu a imagem e prompt: ${prompt}`, size: buffer.length });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;