// arquivos/telegram.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

async function telestick(url) {
    try {
        const match = url.match(/https:\/\/t\.me\/addstickers\/([^\/\?#]+)/);
        if (!match) throw new Error('Invalid url');

        const { data: a } = await axios.get(
            `https://api.telegram.org/bot7935827856:AAGdbLXArulCigWyi6gqR07gi--ZPm7ewhc/getStickerSet?name=${match[1]}`,
            {
                headers: {
                    'user-agent':
                        'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
                }
            }
        );

        const stickers = await Promise.all(
            a.result.stickers.map(async (sticker) => {
                const { data: b } = await axios.get(
                    `https://api.telegram.org/bot7935827856:AAGdbLXArulCigWyi6gqR07gi--ZPm7ewhc/getFile?file_id=${sticker.file_id}`,
                    {
                        headers: {
                            'user-agent':
                                'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
                        }
                    }
                );

                return {
                    emoji: sticker.emoji,
                    is_animated: sticker.is_animated,
                    image_url: `https://api.telegram.org/file/bot7935827856:AAGdbLXArulCigWyi6gqR07gi--ZPm7ewhc/${b.result.file_path}`
                };
            })
        );

        return {
            name: a.result.name,
            title: a.result.title,
            sticker_type: a.result.sticker_type,
            stickers: stickers
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

/* ===== ROTA ===== */
router.get('/telegram', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.json({ error: 'Missing url param' });

        const result = await telestick(url);
        res.json(result);
    } catch (e) {
        res.json({ error: e.message });
    }
});

module.exports = router;