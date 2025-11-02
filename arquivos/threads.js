// arquivos/threads.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');

const router = express.Router();

async function threadsdl(url) {
    try {
        const form = new FormData();
        form.append('search', url);

        const { data } = await axios.post('https://threadsdownload.net/ms?fresh-partial=true', form, {
            headers: {
                ...form.getHeaders(),
                accept: '*/*',
                origin: 'https://threadsdownload.net',
                referer: 'https://threadsdownload.net/ms',
                'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
                'sec-ch-ua-mobile': '?1',
                'sec-ch-ua-platform': '"Android"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
            },
            timeout: 15000
        });

        const $ = cheerio.load(data);
        const jsonString = $(`script[type='application/json']`).text().trim();

        if (!jsonString) throw new Error('JSON não encontrado na página');

        let braceCount = 0;
        let endIndex = -1;
        for (let i = 0; i < jsonString.length; i++) {
            if (jsonString[i] === '{') braceCount++;
            if (jsonString[i] === '}') braceCount--;
            if (braceCount === 0 && jsonString[i] === '}') {
                endIndex = i + 1;
                break;
            }
        }

        if (endIndex === -1) throw new Error('Não foi possível extrair JSON válido');

        const validJsonString = jsonString.slice(0, endIndex);
        const jsonData = JSON.parse(validJsonString);

        return jsonData.v[0][1];

    } catch (error) {
        throw new Error(error.message);
    }
}

// Rota para download de Threads
router.use('/download', async (req, res) => {
    try {
        const url = req.query.url;
        if (!url) return res.status(400).json({ error: 'Informe ?url=' });

        const data = await threadsdl(url);

        res.json({
            apiBy: 'Neext',
            threadUrl: url,
            data
        });
    } catch (err) {
        console.error('[threads.js]', err.message);
        res.status(500).json({ error: 'Erro ao baixar o thread.', details: err.message });
    }
});

module.exports = router;