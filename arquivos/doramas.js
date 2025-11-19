// arquivos/doramas.js
const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const router = express.Router();

const API_NOTE = {
  api: 'API desenvolvida pela Neext',
  instagram: '@neet.tk'
};

// ==== Classe ScrapperDorama ====
class ScrapperDorama {
  static isUrl(url) {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi));
  }

  static UserAgent() {
    const oos = [
      'Macintosh; Intel Mac OS X 10_15_5',
      'Macintosh; Intel Mac OS X 10_11_6',
      'Windows NT 10.0; Win64; x64',
      'Windows NT 10.0; WOW64',
      'Windows NT 10.0',
      'Macintosh; Intel Mac OS X 10_15_7',
      'Macintosh; Intel Mac OS X 10_6_6',
      'Macintosh; Intel Mac OS X 10_9_5',
      'Macintosh; Intel Mac OS X 10_10_5',
      'Macintosh; Intel Mac OS X 10_7_5',
      'Macintosh; Intel Mac OS X 10_11_3',
      'Macintosh; Intel Mac OS X 10_10_3',
      'Macintosh; Intel Mac OS X 10_6_8',
      'Macintosh; Intel Mac OS X 10_10_2',
      'Macintosh; Intel Mac OS X 10_11_5'
    ];
    return `Mozilla/5.0 (${oos[Math.floor(Math.random() * oos.length)]}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 3) + 87}.0.${Math.floor(Math.random() * 190) + 4100}.${Math.floor(Math.random() * 50) + 140} Safari/537.36`;
  }

  static getHTML(url, config = {}) {
    return new Promise((resolve, reject) => {
      request({ url, ...config }, (error, res, body) => {
        if (error) return reject(error);
        try { body = JSON.parse(body) } catch { }
        resolve(body);
      });
    });
  }

  static search(query) {
    return new Promise((resolve, reject) => {
      this.getHTML(`https://doramasonline.org?s=${query}`, { headers: { 'User-Agent': this.UserAgent() } })
        .then((html) => {
          const $ = cheerio.load(html);
          const contentInfo = [];
          $('.result-item').each((i, element) => {
            const title = $(element).find('.title a').text().trim();
            const description = $(element).find('.contenido p').text().trim();
            const releaseDate = $(element).find('.meta .year').text().trim();
            const imageUrl = $(element).find('.thumbnail img').attr('src');
            const link = $(element).find('.thumbnail a').attr('href');
            const type = $(element).find('.tvshows').text().trim() === 'TV' ? 'Série' : 'Filme';
            contentInfo.push({ title, description, releaseDate, imageUrl, link, type });
          });
          resolve(contentInfo);
        }).catch(error => reject(error));
    });
  }

  static newEpisodes() {
    return new Promise((resolve, reject) => {
      this.getHTML(`https://doramasonline.org/br/episodio`, { headers: { 'User-Agent': this.UserAgent() } })
        .then((html) => {
          const $ = cheerio.load(html);
          const episodes = [];
          $('.item.se.episodes').each((index, element) => {
            const title = $(element).find('span.serie').text().trim();
            const seasonEpisode = $(element).find('h3').text().trim();
            const imageUrl = $(element).find('.poster img').attr('src');
            const link = $(element).find('.season_m a').attr('href');
            const releaseInfo = $(element).find('.videotext div:first-child').text().trim();
            episodes.push({ title, seasonEpisode, imageUrl, link, releaseInfo });
          });
          resolve(episodes);
        }).catch(error => reject(error));
    });
  }

  static infoSerie(url) {
    return new Promise((resolve, reject) => {
      if (!this.isUrl(url)) return reject('O campo de URL não foi preenchido.');
      this.getHTML(url, { headers: { 'User-Agent': this.UserAgent() } })
        .then((html) => {
          const $ = cheerio.load(html);
          const showInfo = {
            title: $('.sheader h1').text().trim(),
            releaseYear: $('.sheader .date').text().trim(),
            imageUrl: $('.sheader .poster img').attr('src'),
            rating: $('.starstruck-rating .dt_rating_vgs').text().trim(),
            ratingCount: $('.starstruck-rating .rating-count').text().trim(),
            genres: [],
            episodes: []
          };
          $('.sgeneros a').each((i, element) => showInfo.genres.push($(element).text().trim()));
          $('#episodes .episodios li').each((index, element) => {
            const title = $(element).find('.episodiotitle a').text().trim();
            const number = $(element).find('.numerando').text().trim();
            const releaseDate = $(element).find('.date').text().trim();
            const url = $(element).find('.episodiotitle a').attr('href');
            const imageUrl = $(element).find('.imagen img').attr('src');
            showInfo.episodes.push({ title, number, releaseDate, url, imageUrl });
          });
          resolve(showInfo);
        }).catch(error => reject(error));
    });
  }

  static infoFilme(url) {
    return new Promise((resolve, reject) => {
      if (!this.isUrl(url)) return reject('O campo de URL não foi preenchido.');
      this.getHTML(url, { headers: { 'User-Agent': this.UserAgent() } })
        .then((html) => {
          const $ = cheerio.load(html);
          const filmInfo = {
            title: $('h1').text().trim(),
            releaseDate: $('.date').text().trim(),
            country: $('.country').text().trim(),
            duration: $('.runtime').text().trim(),
            rating: {
              value: $('.dt_rating_vgs').text().trim(),
              count: $('.rating-count').text().trim()
            },
            genres: $('.sgeneros a').map((i, el) => $(el).text().trim()).get(),
            synopsis: $('#info .wp-content p').text().trim() || $('.wp-content span._1H6ABQ').text().trim(),
            cast: []
          };
          $('#cast .person').each((i, el) => {
            const name = $(el).find('.name a').text().trim();
            const character = $(el).find('.caracter').text().trim();
            const imageUrl = $(el).find('.img img').attr('src');
            filmInfo.cast.push({ name, character, imageUrl });
          });
          resolve(filmInfo);
        }).catch(error => reject(error));
    });
  }
}

// ==== Rotas Express ====
router.get('/search', async (req, res) => {
  const query = req.query.q || req.query.name;
  if (!query) return res.status(400).json({ ...API_NOTE, status: 'error', message: 'Parâmetro "q" é obrigatório' });

  try {
    const result = await ScrapperDorama.search(query);
    return res.status(200).json({ ...API_NOTE, status: 'success', results: result });
  } catch (error) {
    return res.status(500).json({ ...API_NOTE, status: 'error', message: error });
  }
});

router.get('/episodes', async (req, res) => {
  try {
    const episodes = await ScrapperDorama.newEpisodes();
    return res.status(200).json({ ...API_NOTE, status: 'success', results: episodes });
  } catch (error) {
    return res.status(500).json({ ...API_NOTE, status: 'error', message: error });
  }
});

router.get('/serie', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ ...API_NOTE, status: 'error', message: 'Parâmetro "url" é obrigatório' });

  try {
    const info = await ScrapperDorama.infoSerie(url);
    return res.status(200).json({ ...API_NOTE, status: 'success', results: info });
  } catch (error) {
    return res.status(500).json({ ...API_NOTE, status: 'error', message: error });
  }
});

router.get('/filme', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ ...API_NOTE, status: 'error', message: 'Parâmetro "url" é obrigatório' });

  try {
    const info = await ScrapperDorama.infoFilme(url);
    return res.status(200).json({ ...API_NOTE, status: 'success', results: info });
  } catch (error) {
    return res.status(500).json({ ...API_NOTE, status: 'error', message: error });
  }
});

// ==== Exportar router para index.js ====
module.exports = router;