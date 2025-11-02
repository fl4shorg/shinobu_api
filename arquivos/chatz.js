const express = require('express');
const router = express.Router();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/**
 * Função principal para conversar com ChatZ
 */
async function zai(question, { model = 'glm-4.5', system_prompt = null, search = false } = {}) {
    try {
        const _model = {
            'glm-4.5': '0727-360B-API',
            'glm-4.5-air': '0727-106B-API',
            'glm-4-32b': 'main_chat',
            'glm-4.1v-9b-thinking': 'GLM-4.1V-Thinking-FlashX',
            'z1-rumination': 'deep-research',
            'z1-32b': 'zero',
            'glm-4-flash': 'glm-4-flash'
        };
        
        if (!question) throw new Error('Question is required');
        if (!_model[model]) throw new Error(`Available models: ${Object.keys(_model).join(', ')}`);
        if (typeof search !== 'boolean') throw new Error('Search must be a boolean');
        
        const rynn = await axios.get('https://chat.z.ai/api/v1/auths/');
        const { data } = await axios.post('https://chat.z.ai/api/chat/completions', {
            messages: [
                ...(system_prompt ? [{ role: 'system', content: system_prompt }] : []),
                { role: 'user', content: question }
            ],
            ...(search ? { mcp_servers: ['deep-web-search'] } : {}),
            model: _model[model],
            chat_id: 'local',
            id: uuidv4(),
            stream: true
        }, {
            headers: {
                authorization: `Bearer ${rynn.data.token}`,
                cookie: rynn.headers['set-cookie'].join('; '),
                'x-fe-version': 'prod-fe-1.0.52'
            }
        });
        
        return data.split('\n\n')
            .filter(line => line)
            .map(line => JSON.parse(line.substring(6)))
            .filter(line => line?.data?.phase !== 'thinking')
            .map(line => line?.data?.delta_content)
            .join('');
    } catch (error) {
        throw new Error(error.message);
    }
}

// 🔹 Rota GET usando router Express
router.use(async (req, res) => {
    try {
        const { question, model, system_prompt, search } = req.query;
        if (!question) return res.status(400).json({ error: 'Parâmetro "question" é obrigatório.' });

        const response = await zai(question, { 
            model, 
            system_prompt, 
            search: search === 'true' 
        });
        res.json({ reply: response });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;