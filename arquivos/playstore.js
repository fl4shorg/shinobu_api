// arquivos/Playstore.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

async function PlayStore(search) {
  try {
    const { data } = await axios.get(`https://play.google.com/store/search?q=${encodeURIComponent(search)}&c=apps`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });

    const $ = cheerio.load(data);
    const hasil = [];

    $('.ULeU3b > .VfPpkd-WsjYwc.VfPpkd-WsjYwc-OWXEXe-INsAgc.KC1dQ.Usd1Ac.AaN0Dd.Y8RQXd > .VfPpkd-aGsRMb > .VfPpkd-EScbFb-JIbuQc.TAQqTe > a').each((i, u) => {
      const linkk = $(u).attr('href');
      const nama = $(u).find('.j2FCNc > .cXFu1 > .ubGTjb > .DdYX5').text();
      const developer = $(u).find('.j2FCNc > .cXFu1 > .ubGTjb > .wMUdtb').text();
      const img = $(u).find('.j2FCNc > img').attr('src');
      const rate = $(u).find('.j2FCNc > .cXFu1 > .ubGTjb > div').attr('aria-label');
      const rate2 = $(u).find('.j2FCNc > .cXFu1 > .ubGTjb > div > span.w2kbF').text();
      const link = `https://play.google.com${linkk}`;
      if (linkk) {
        hasil.push({
          link: link,
          nama: nama || 'No name',
          developer: developer || 'No Developer',
          img: img || 'https://i.ibb.co/G7CrCwN/404.png',
          rate: rate || 'No Rate',
          rate2: rate2 || 'No Rate',
          link_dev: `https://play.google.com/store/apps/developer?id=${developer.split(" ").join('+')}`
        });
      }
    });

    if (!hasil.length) {
      return [{ message: 'Tidak ada result!' }];
    }
    return hasil;
  } catch (err) {
    console.error('Erro Playstore:', err.message);
    return [{ message: 'Erro ao processar pesquisa' }];
  }
}

// Rota Express
router.get('/', async (req, res) => {
  const q = req.query.q || req.query.search;
  if (!q) return res.status(400).json({ status: false, message: 'Parâmetro "q" é obrigatório' });

  const result = await PlayStore(q);
  res.json(result);
});

module.exports = router;