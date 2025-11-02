// qwen.js
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const router = express.Router();

class Qwen {
    constructor({ email, password }) {
        if (!email) throw new Error('Email is required.');
        if (!password) throw new Error('Password is required.');
        
        this.api = axios.create({
            baseURL: 'https://chat.qwen.ai/api',
            headers: {
                'Bx-V': '2.5.31',
                'Connection': 'keep-alive',
                'Host': 'chat.qwen.ai',
                'Origin': 'https://chat.qwen.ai',
                'Referer': 'https://chat.qwen.ai/',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
                'Version': '0.0.230',
                'X-Request-Id': crypto.randomUUID()
            }
        });

        this.types = {
            chat: 't2t',
            search: 'search',
            thinking: 'think'
        };
        this.token = '';
        this.expiresAt = 0;
        this.email = email;
        this.password = password;
        this.isInitialized = false;
    }

    isTokenExpired() {
        return !this.token || Date.now() / 1000 >= this.expiresAt - 300;
    }

    async refreshToken() {
        try {
            const { data } = await this.api.get('/v1/auths', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (data.token && data.expires_at) {
                this.token = data.token;
                this.expiresAt = data.expires_at;
                return data;
            }
        } catch {
            await this.login();
        }
    }

    async ensureValidToken() {
        if (!this.isInitialized) {
            await this.login();
            this.isInitialized = true;
        } else if (this.isTokenExpired()) {
            await this.refreshToken();
        }
    }

    async login() {
        const { data } = await this.api.post('/v1/auths/signin', {
            email: this.email,
            password: crypto.createHash('sha256').update(this.password).digest('hex')
        });
        this.token = data.token;
        this.expiresAt = data.expires_at;
        return data;
    }

    async models() {
        await this.ensureValidToken();
        const { data } = await this.api.get('/models', {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        return data.data.map(model => {
            const abilities = model.info.meta.abilities || {};
            const chatTypes = model.info.meta.chat_type || [];
            return {
                id: model.id,
                thinking: abilities.thinking === 1 || abilities.thinking === 4 || false,
                search: chatTypes.includes('search'),
                vision: abilities.vision === 1 || false
            };
        });
    }

    async setInstruction(prompt) {
        await this.ensureValidToken();
        if (!prompt) throw new Error('Prompt is required.');
        const { data } = await this.api.post('/v2/users/user/settings/update', {
            personalization: {
                name: '',
                description: '',
                style: '',
                instruction: prompt,
                enable_for_new_chat: true
            }
        }, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        return data.data;
    }

    async newChat({ model = 'qwen3-max' } = {}) {
        await this.ensureValidToken();
        const models = await this.models();
        if (!models.map(m => m.id).includes(model)) throw new Error('Model not found.');
        const { data } = await this.api.post('/v2/chats/new', {
            title: 'New Chat',
            models: [model],
            chat_mode: 'normal',
            chat_type: 't2t',
            timestamp: Date.now()
        }, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        return data.data.id;
    }

    async chat(question, { instruction = null, model = 'qwen3-max', type = 'chat', chatId = null } = {}) {
        await this.ensureValidToken();
        if (!question) throw new Error('Question is required.');

        const models = await this.models();
        if (!models.map(m => m.id).includes(model)) throw new Error('Model not found.');

        let parent = null;
        if (chatId) {
            const { data } = await this.api.get(`/v2/chats/${chatId}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            parent = data.data.currentId;
        } else {
            chatId = await this.newChat({ model });
        }

        if (instruction) await this.setInstruction(instruction);

        const { data } = await this.api.post('/v2/chat/completions', {
            stream: true,
            incremental_output: true,
            chat_id: chatId,
            chat_mode: 'normal',
            model,
            parent_id: parent,
            messages: [
                {
                    fid: crypto.randomUUID(),
                    parentId: parent,
                    role: 'user',
                    content: question,
                    timestamp: Date.now(),
                    chat_type: this.types[type],
                    sub_chat_type: this.types[type]
                }
            ],
            timestamp: Date.now()
        }, {
            headers: { 'Authorization': `Bearer ${this.token}` },
            params: { chat_id: chatId }
        });

        const lines = data.split('\n\n').filter(l => l.trim()).map(l => JSON.parse(l.substring(6)));
        const res = {
            chatId,
            response: { reasoning: '', content: '', web_search: [] },
            timestamp: new Date().toISOString()
        };

        lines.forEach(l => {
            const d = l?.choices?.[0]?.delta;
            if (d?.phase === 'think' && d.content) res.response.reasoning += d.content;
            if (d?.phase === 'answer' && d.content) res.response.content += d.content;
        });

        return res;
    }
}

// Instância única
const qwen = new Qwen({
    email: 'xxx@gmail.com',
    password: 'xxx'
});

// 🔹 Endpoint GET /ask
router.get('/ask', async (req, res) => {
    try {
        const { question, instruction } = req.query;
        if (!question) return res.status(400).json({ error: 'Parâmetro "question" é obrigatório.' });
        const result = await qwen.chat(question, { instruction });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;