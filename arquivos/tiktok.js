const express = require('express');
const router = express.Router();
const axios = require('axios');
const { load } = require('cheerio');

// ======== FUNÇÃO PRINCIPAL ========
async function getTikTokInfo(url) {
    try {
        const host = 'https://ttsave.app/download';
        const body = { language_id: '1', query: url };
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://ttsave.app',
            'Referer': 'https://ttsave.app/',
        };

        const response = await axios.post(host, body, { headers });
        const $ = load(response.data);

        // Seleção dos elementos
        const $div = $('div.flex').first();
        const nickname = $div.find('h2').text() || '';
        const username = $div.find('a.font-extrabold').text() || '';
        const avatar = $div.find('a > img').attr('src') || '';
        const description = $div.find('p').text() || '';

        const stats = $div.find('div.flex > div.flex > span');
        const played = stats.eq(0).text() || '';
        const commented = stats.eq(1).text() || '';
        const saved = stats.eq(2).text() || '';
        const shared = stats.eq(3).text() || '';

        const song = $div.find('div.flex > span').eq(4).text() || '';

        const $a = $('#button-download-ready > a');
        const noWatermark = $a.eq(0).attr('href') || '';
        const withWatermark = $a.eq(1).attr('href') || '';
        const audio = $a.eq(2).attr('href') || '';
        const thumbnail = $a.eq(4).attr('href') || '';

        return {
            success: true,
            author: { nickname, username, avatar, description },
            video: {
                thumbnail,
                played,
                commented,
                saved,
                shared,
                url: { noWatermark, withWatermark }
            },
            song,
            audio
        };
    } catch (error) {
        console.error('TikTok Scraper Error:', error.message);
        return { success: false, message: error.message };
    }
}

// ======== ROTA ========
router.get('/', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.json({ success: false, message: "Query 'url' is required" });
    const data = await getTikTokInfo(url);
    res.json(data);
});

module.exports = router;