const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Função para conversar com ChatGPT 2022
 * @param {string} question - Pergunta do usuário
 * @param {Object} options
 * @param {string} options.model - Modelo ('gpt-5' ou 'gpt-3.5')
 * @param {string} options.reasoning_effort - Nível de raciocínio ('minimal', 'low', 'medium', 'high')
 */
async function chatgpt2022(question, { model = 'gpt-5', reasoning_effort = 'medium' } = {}) {
    try {
        const conf = {
            models: ['gpt-5', 'gpt-3.5'],
            reasoning: ['minimal', 'low', 'medium', 'high']
        };
        
        if (!question) throw new Error('Question is required');
        if (!conf.models.includes(model)) throw new Error(`Available models: ${conf.models.join(', ')}`);
        if (model === 'gpt-5' && !conf.reasoning.includes(reasoning_effort)) throw new Error(`Available reasoning effort: ${conf.reasoning.join(', ')}`);
        
        const { data } = await axios.post('https://chatgpt-2022.vercel.app/api/chat', {
            conversationId: Date.now().toString(),
            messages: [{ role: 'user', content: question }],
            ...(model === 'gpt-5' ? { reasoningEffort: reasoning_effort } : {}),
            model: model
        }, {
            headers: {
                'content-type': 'application/json',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
            }
        });

        const lines = data.split('\n\n').filter(line => line.trim());
        const reasoning = lines.map(line => JSON.parse(line.substring(6))).filter(line => line.type === 'reasoning-done')?.[0]?.text || '';
        const text = lines.map(line => JSON.parse(line.substring(6))).filter(line => line.type === 'text-delta').map(line => line.textDelta).join('') || '';
        
        return { reasoning, text };
    } catch (error) {
        throw new Error(error.message);
    }
}

// 🔹 Rota GET dentro do router Express
router.use(async (req, res) => {
    try {
        const { question, model, reasoning_effort } = req.query;
        if (!question) return res.status(400).json({ error: 'Parâmetro "question" é obrigatório.' });

        const response = await chatgpt2022(question, { model, reasoning_effort });
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;