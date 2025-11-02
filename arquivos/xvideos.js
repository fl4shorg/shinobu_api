const { fetch } = require('undici');
const cheerio = require('cheerio');
const express = require('express');

// Criar dois routers separados
const xvideosSearchRouter = express.Router();
const xvideosDownloadRouter = express.Router();

class Xvideos {
    async search(q) {
        try {
            const page = Math.floor(3 * Math.random()) + 1;
            const resp = await fetch(`https://www.xvideos.com/?k=${encodeURIComponent(q)}&p=${page}`);
            const $ = cheerio.load(await resp.text());

            const res = [];
            const videos = $('div[id*="video"]');

            for (let i = 0; i < videos.length; i++) {
                const bkp = videos[i];
                const title = $(bkp).find('.thumb-under p.title a').contents().not('span').text().trim();
                const resolution = $(bkp).find('.thumb-inside .thumb span').text().trim();
                const duration = $(bkp).find('.thumb-under p.metadata span.duration').text().trim();
                const artist = $(bkp).find('.thumb-under p.metadata a span.name').text().trim();
                const cover = $(bkp).find('.thumb-inside .thumb img').attr('data-src');
                const url = $(bkp).find('.thumb-inside .thumb a').attr('href');

                if (url) {
                    const fullUrl = 'https://www.xvideos.com' + url;
                    let downloads = {};
                    try {
                        downloads = await this.download(fullUrl);
                    } catch (e) {
                        downloads = { videos: {}, thumb: cover };
                    }

                    res.push({
                        title,
                        resolution,
                        duration,
                        artist,
                        cover,
                        url: fullUrl,
                        downloads
                    });
                }
            }

            return res;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async download(url) {
        try {
            const resp = await fetch(url);
            const $ = cheerio.load(await resp.text());

            const scriptContent = $('#video-player-bg > script:nth-child(6)').html();
            const extractData = (regex) => (scriptContent?.match(regex) || [])[1];

            const videos = {
                low: extractData(/html5player\.setVideoUrlLow\('(.*?)'\);/),
                high: extractData(/html5player\.setVideoUrlHigh\('(.*?)'\);/),
                HLS: extractData(/html5player\.setVideoHLS\('(.*?)'\);/)
            };

            const thumb = extractData(/html5player\.setThumbUrl\('(.*?)'\);/);

            return { videos, thumb };
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

const xvid = new Xvideos();

// Rota de pesquisa
xvideosSearchRouter.get('/', async (req, res) => {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'Parâmetro q é obrigatório' });

    try {
        const results = await xvid.search(q);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota de download
xvideosDownloadRouter.get('/', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'Parâmetro url é obrigatório' });

    try {
        const data = await xvid.download(url);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Exportar os dois routers separados
module.exports = {
    searchRouter: xvideosSearchRouter,
    downloadRouter: xvideosDownloadRouter
};