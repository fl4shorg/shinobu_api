// igstory.js
const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');

class IGStoryDownloader {
    constructor(isDebug = false) {
        this.isDebug = isDebug;
    }

    log = (text) => {
        if (this.isDebug) console.log('[IGStoryDownloader]', text);
    }

    download = async (url) => {
        try {
            if (!/^https:\/\/www\.instagram\.com\/stories\/[a-zA-Z0-9_.]+\/\d+/.test(url)) {
                throw new Error('Invalid Instagram Story URL');
            }

            // Primeiro POST para pegar o token
            const tokenForm = new FormData();
            tokenForm.append('url', url);

            const { data: tokenResp } = await axios.post(
                'https://savevid.net/api/userverify',
                tokenForm,
                { headers: tokenForm.getHeaders() }
            );

            // Segundo POST para pegar os links do story
            const form = new FormData();
            form.append('q', url);
            form.append('t', 'media');
            form.append('lang', 'en');
            form.append('v', 'v2');
            form.append('cftoken', tokenResp.token);

            const { data } = await axios.post(
                'https://v3.savevid.net/api/ajaxSearch',
                form,
                { headers: form.getHeaders() }
            );

            const $ = cheerio.load(data.data);
            const stories = [];

            $('ul.download-box > li').each((_, el) => {
                const dl_url = $(el).find('.download-items__btn:not(.dl-thumb) a').attr('href');
                if (dl_url) stories.push(dl_url);
            });

            if (stories.length === 0) throw new Error('Nenhum story encontrado ou privado');

            return stories;

        } catch (err) {
            throw new Error(err.message);
        }
    }
}

module.exports = IGStoryDownloader;