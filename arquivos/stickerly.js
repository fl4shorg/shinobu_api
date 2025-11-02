// arquivos/stickerly.js
const express = require('express');
const axios = require('axios');

const router = express.Router();

class StickerLy {
  search = async function (query) {
    if (!query) throw new Error('Query is required');
    const { data } = await axios.post('https://api.sticker.ly/v4/stickerPack/smartSearch', {
      keyword: query,
      enabledKeywordSearch: true,
      filter: {
        extendSearchResult: false,
        sortBy: 'RECOMMENDED',
        languages: ['ALL'],
        minStickerCount: 5,
        searchBy: 'ALL',
        stickerType: 'ALL'
      }
    }, {
      headers: {
        'user-agent': 'androidapp.stickerly/3.17.0 (Redmi Note 4; U; Android 29; in-ID; id;)',
        'content-type': 'application/json',
        'accept-encoding': 'gzip'
      }
    });

    return data.result.stickerPacks.map(pack => ({
      name: pack.name,
      author: pack.authorName,
      stickerCount: pack.resourceFiles.length,
      viewCount: pack.viewCount,
      exportCount: pack.exportCount,
      isPaid: pack.isPaid,
      isAnimated: pack.isAnimated,
      thumbnailUrl: `${pack.resourceUrlPrefix}${pack.resourceFiles[pack.trayIndex]}`,
      url: pack.shareUrl
    }));
  }

  detail = async function (url) {
    const match = url.match(/\/s\/([^\/\?#]+)/);
    if (!match) throw new Error('Invalid url');

    const { data } = await axios.get(`https://api.sticker.ly/v4/stickerPack/${match[1]}?needRelation=true`, {
      headers: {
        'user-agent': 'androidapp.stickerly/3.17.0 (Redmi Note 4; U; Android 29; in-ID; id;)',
        'content-type': 'application/json',
        'accept-encoding': 'gzip'
      }
    });

    return {
      name: data.result.name,
      author: {
        name: data.result.user.displayName,
        username: data.result.user.userName,
        bio: data.result.user.bio,
        followers: data.result.user.followerCount,
        following: data.result.user.followingCount,
        isPrivate: data.result.user.isPrivate,
        avatar: data.result.user.profileUrl,
        website: data.result.user.website,
        url: data.result.user.shareUrl
      },
      stickers: data.result.stickers.map(stick => ({
        fileName: stick.fileName,
        isAnimated: stick.isAnimated,
        imageUrl: `${data.result.resourceUrlPrefix}${stick.fileName}`
      })),
      stickerCount: data.result.stickers.length,
      viewCount: data.result.viewCount,
      exportCount: data.result.exportCount,
      isPaid: data.result.isPaid,
      isAnimated: data.result.isAnimated,
      thumbnailUrl: `${data.result.resourceUrlPrefix}${data.result.stickers[data.result.trayIndex].fileName}`,
      url: data.result.shareUrl
    };
  }
}

const stickerly = new StickerLy();

// Endpoint de pesquisa
router.use('/search', async (req, res) => {
  try {
    const q = req.query.q;
    const results = await stickerly.search(q);
    res.json({
      api: 'API desenvolvida pela Neext',
      query: q,
      results
    });
  } catch (err) {
    console.error('[stickerly/search]', err.message);
    res.status(500).json({ error: 'Erro ao pesquisar stickers.', details: err.message });
  }
});

// Endpoint de detalhes do pacote
router.use('/detail', async (req, res) => {
  try {
    const url = req.query.url;
    const details = await stickerly.detail(url);
    res.json({
      api: 'API desenvolvida pela Neext',
      ...details
    });
  } catch (err) {
    console.error('[stickerly/detail]', err.message);
    res.status(500).json({ error: 'Erro ao buscar detalhes do pacote.', details: err.message });
  }
});

module.exports = router;