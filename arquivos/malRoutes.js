const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

class MAL {
    async topAnime() {
        try {
            const { data } = await axios.get('https://myanimelist.net/topanime.php');
            const $ = cheerio.load(data);
            const animeList = [];

            $('.ranking-list').each((_, element) => {
                const infoText = $(element).find('.information').text();
                const type = infoText.split('
')[1].trim();
                const release = infoText.split('
')[2].trim();
                const members = infoText.split('
')[3].trim();

                animeList.push({
                    rank: $(element).find('.rank').text().trim(),
                    title: $(element).find('.title h3 a').text().trim(),
                    score: $(element).find('.score span').text().trim(),
                    type,
                    release,
                    members,
                    cover: $(element).find('.title img').attr('data-src'),
                    url: $(element).find('.title h3 a').attr('href'),
                });
            });

            return animeList;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async seasonalAnime(season, type) {
        try {
            const validSeasons = ['fall', 'spring', 'winter', 'summer'];
            const validTypes = {
                'tv-new': 'TV (New)',
                'tv-continuing': 'TV (Continuing)',
                'ona': 'ONA',
                'ova': 'OVA',
                'movie': 'Movie',
                'special': 'Special',
            };

            if (!validSeasons.includes(season)) throw new Error(`Available seasons: ${validSeasons.join(', ')}`);
            if (!validTypes[type]) throw new Error(`Available types: ${Object.keys(validTypes).join(', ')}`);

            const { data } = await axios.get(`https://myanimelist.net/anime/season/2024/${season}`);
            const $ = cheerio.load(data);
            const animeList = [];

            $('.seasonal-anime-list').each((_, list) => {
                const typeTxt = $(list).find('.anime-header').text().trim();

                $(list).find('.js-seasonal-anime').each((_, element) => {
                    const title = $(element).find('.h2_anime_title > a').text().trim();
                    const url = $(element).find('.h2_anime_title > a').attr('href');
                    const cover = $(element).find('.image > a > img').attr('src') || $(element).find('.image > a > img').attr('data-src');
                    const score = $(element).find('.js-score').text().trim();
                    const members = $(element).find('.js-members').text().trim();
                    const formattedMembers = Number(members.replace(/D/g, '')).toLocaleString('en-US');

                    const infoDiv = $(element).find('.info');
                    const releaseDate = infoDiv.find('.item:first-child').text().trim();
                    const totalEps = infoDiv.find('.item:nth-child(2) span:first-child').text().trim();
                    const duration = infoDiv.find('.item:nth-child(2) span:nth-child(2)').text().trim();
                    const totalEpsWithDuration = `${totalEps}, ${duration}`;

                    const synopsis = $(element).find('.synopsis p').text().trim();

                    const studio = $(element).find('.property:contains("Studio") .item').text().trim();
                    const source = $(element).find('.property:contains("Source") .item').text().trim();
                    const themes = $(element).find('.property:contains("Themes") .item').map((_, theme) => $(theme).text().trim()).get().join(', ');
                    const genres = $(element).find('.genres .genre a').map((_, g) => $(g).text().trim()).get().join(', ');

                    animeList.push({
                        title,
                        type: typeTxt || 'Unknown',
                        url,
                        cover,
                        stats: { score: score || 'N/A', members: formattedMembers || 'N/A' },
                        details: { releaseDate, totalEpisodes: totalEpsWithDuration, studio, source },
                        tags: { themes: themes || 'None', genres: genres || 'None' },
                        synopsis,
                    });
                });
            });

            return animeList.filter(obj => obj.type === validTypes[type]);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async animeSearch(query) {
        try {
            if (!query) throw new Error('Query is required');

            const { data } = await axios.get(`https://myanimelist.net/anime.php?q=${query}&cat=anime`);
            const $ = cheerio.load(data);
            const animeList = [];

            $('table tbody tr').each((_, element) => {
                const cover = $(element).find('td:nth-child(1) img').attr('data-src') || $(element).find('td:nth-child(1) img').attr('src');
                const title = $(element).find('td:nth-child(2) strong').text().trim();
                const url = $(element).find('td:nth-child(2) a').attr('href');
                const type = $(element).find('td:nth-child(3)').text().trim();
                const episodes = $(element).find('td:nth-child(4)').text().trim();
                const score = $(element).find('td:nth-child(5)').text().trim();
                const description = $(element).find('td:nth-child(2) .pt4').text().replace('read more.', '').trim() || 'No Desc';

                if (title && url) {
                    animeList.push({ title, description, type, episodes, score, cover, url });
                }
            });

            return animeList;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

const mal = new MAL();

router.get('/topanime', async (req, res) => {
    try {
        const result = await mal.topAnime();
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.get('/seasonal', async (req, res) => {
    try {
        const { season, type } = req.query;
        const result = await mal.seasonalAnime(season, type);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.get('/animeSearch', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ error: 'Query is required' });
        const result = await mal.animeSearch(query);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;