// arquivos/lyrics.js
const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const router = express.Router();

const API_NOTE = {
  api: 'API desenvolvida pela Neext',
  instagram: '@neet.tk'
};

// ==== Classe ScrapperData ====
class ScrapperData {
  static getHTML(url, config = {}) {
    return new Promise((resolve, reject) => {
      request({ url, ...config }, (error, res, body) => {
        if (error) return reject(error);
        try { body = JSON.parse(body) } catch {}
        resolve(body);
      });
    });
  }

  static UserAgent() {
    const oos = [
      'Macintosh; Intel Mac OS X 10_15_5',
      'Windows NT 10.0; Win64; x64',
      'Macintosh; Intel Mac OS X 10_11_6'
    ];
    return `Mozilla/5.0 (${oos[Math.floor(Math.random() * oos.length)]}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 3) + 87}.0.${Math.floor(Math.random() * 190) + 4100}.${Math.floor(Math.random() * 50) + 140} Safari/537.36`;
  }

  static Lyrics(query) {
    return new Promise((resolve, reject) => {
      this.getHTML(`https://solr.sscdn.co/letras/m1/?q=${query}&wt=json&callback=LetrasSug`, {
        headers: { 'User-Agent': this.UserAgent() }
      })
      .then(async (response) => {
        if (typeof response === 'string') {
          const start = response.indexOf('(');
          const end = response.lastIndexOf(')');
          if (start !== -1 && end !== -1 && start < end) {
            const jsonString = response.slice(start + 1, end);
            const jsonData = JSON.parse(jsonString);

            const result = await Promise.all(jsonData.response.docs.map(async (doc) => {
              const responseSong = await this.getHTML(`https://www.letras.mus.br/${doc.dns || ''}/${doc.url || doc.urlal || ''}/`);
              const $ = cheerio.load(responseSong);
              const imgSet = $('.thumbnail img').attr('srcset');
              const img = imgSet ? imgSet.split(', ')[1].split(' ')[0] : null;

              // Remove quebras de linha das letras
              const lyrics = $('.lyric-original p')
                .map((i, el) => $(el).html().replace(/<br\/?>/g, ' '))
                .get()
                .join(' ');

              return { 
                ...doc,
                img,
                url: `https://www.letras.mus.br/${doc.dns || ''}/${doc.url || doc.urlal || ''}`,
                lyrics
              };
            }));

            if (result.length === 0) return reject('Nenhum resultado encontrado.');
            return resolve(result);
          }
        }
      })
      .catch((error) => reject(error.message));
    });
  }
}

// ==== Rota Express ====
router.get('/search', async (req, res) => {
  const query = req.query.q || req.query.name;

  if (!query) {
    return res.status(400).json({
      ...API_NOTE,
      status: 'error',
      message: 'Parâmetro "q" é obrigatório (ex: ?q=Nome da Música)'
    });
  }

  try {
    const result = await ScrapperData.Lyrics(query);

    // Remove quebras de linha adicionais (garantia)
    const cleanResult = result.map(r => ({
      ...r,
      lyrics: r.lyrics ? r.lyrics.replace(/\n/g, ' ') : ''
    }));

    return res.status(200).json({
      ...API_NOTE,
      status: 'success',
      message: `Resultados encontrados para "${query}"`,
      results: cleanResult
    });
  } catch (error) {
    return res.status(500).json({
      ...API_NOTE,
      status: 'error',
      message: error
    });
  }
});

module.exports = router;