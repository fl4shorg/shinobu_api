const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');

const baseUrl = 'https://ssstik.io';
const regexTiktokUrl = /https:\/\/(?:m|www|vm|vt|lite)?\.?tiktok\.com\/((?:.*\b(?:(?:usr|v|embed|user|video|photo)\/|\?shareId=|\&item_id)(\d+))|\w+)/;
const regexSsstikToken = /s_tt\s*=\s*'([^']+)'/;
const regexOverlayUrl = /#mainpicture \.result_overlay\s*{\s*background-image:\s*url\(["']?([^"']+)["']?\);\s*}/;

// ======== FUNÇÃO AUXILIAR PARA PEGAR TOKEN ========
async function extractToken() {
  try {
    const { data: html } = await axios.get(baseUrl);
    const matchedToken = html.match(regexSsstikToken);
    if (matchedToken && matchedToken.length > 1) {
      return matchedToken[1];
    } else {
      throw new Error("Can't get the ssstik token.");
    }
  } catch (error) {
    throw new Error('Error fetching ssstik token.');
  }
}

// ======== FUNÇÃO PRINCIPAL ========
async function getTikTok2Info(url) {
  if (!regexTiktokUrl.test(url)) {
    throw new Error('Must be a valid TikTok URL.');
  }

  const token = await extractToken();
  const basePostUrl = `${baseUrl}/abc?url=dl`;
  const formData = new FormData();
  formData.append('id', url);
  formData.append('locale', 'en');
  formData.append('tt', token);

  const { data: html } = await axios.post(basePostUrl, formData, {
    headers: {
      ...formData.getHeaders(),
      origin: baseUrl,
      referer: `${baseUrl}/en`,
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    },
    maxRedirects: 5
  });

  const $ = cheerio.load(html);

  const username = $('h2').text().trim();
  const description = $('.maintext').text().trim();
  const likeCount = $('div.trending-actions > div.justify-content-start').eq(0).text().trim();
  const commentCount = $('div.trending-actions > div.justify-content-center > div').text().trim();
  const shareCount = $('div.trending-actions > div.justify-content-end > div').text().trim();
  const avatarUrl = $('img.result_author').attr('src');
  const videoUrl = $('a.without_watermark').attr('href');
  const musicUrl = $('a.music').attr('href');

  // pegar overlay do estilo CSS
  const styleContent = $('style').html();
  const overlayMatch = styleContent ? styleContent.match(regexOverlayUrl) : null;
  const overlayUrl = overlayMatch ? overlayMatch[1] : null;

  return {
    success: true,
    author: {
      username,
      description
    },
    statistics: {
      likeCount,
      commentCount,
      shareCount
    },
    downloads: {
      avatarUrl,
      overlayUrl,
      videoUrl,
      musicUrl
    }
  };
}

// ======== ROTA ========
router.get('/', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.json({ success: false, message: "Query 'url' is required" });

  try {
    const data = await getTikTok2Info(url);
    res.json(data);
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

module.exports = router;