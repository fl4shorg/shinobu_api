// arquivos/youtube.js
// • YouTube MP4 Downloader Rápido + Pesquisa MP3 • Desenvolvido por Neext •

const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const ytSearch = require("yt-search");

const router = express.Router();

// ===================== Código SaveTube =====================
const savetube = {
  api: { base: "https://media.savetube.me/api", cdn: "/random-cdn", info: "/v2/info", download: "/download" },
  headers: {
    'accept': '*/*',
    'content-type': 'application/json',
    'origin': 'https://yt.savetube.me',
    'referer': 'https://yt.savetube.me/',
    'user-agent': 'Postify/1.0.0'
  },
  formatVideo: ['144','240','360','480','720','1080','1440','2k','3k','4k','5k','8k'],
  formatAudio: ['mp3','m4a','webm','aac','flac','opus','ogg','wav'],
  crypto: {
    hexToBuffer: hexString => Buffer.from(hexString.match(/.{1,2}/g).join(''), 'hex'),
    decrypt: async enc => {
      const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
      const data = Buffer.from(enc, 'base64');
      const iv = data.slice(0,16);
      const content = data.slice(16);
      const key = savetube.crypto.hexToBuffer(secretKey);
      const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
      let decrypted = decipher.update(content);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return JSON.parse(decrypted.toString());
    }
  },
  isUrl: str => { try { new URL(str); return true } catch (_) { return false } },
  youtube: url => {
    if (!url) return null;
    const patterns = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/
    ];
    for (let p of patterns) if (p.test(url)) return url.match(p)[1];
    return null;
  },
  request: async (endpoint, data={}, method='post') => {
    try {
      const { data: response } = await axios({ method, url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`, data: method==='post'?data:undefined, params: method==='get'?data:undefined, headers: savetube.headers });
      return { status:true, code:200, data:response };
    } catch(e) { return { status:false, code:e.response?.status||500, error:e.message } }
  },
  getCDN: async () => {
    const response = await savetube.request(savetube.api.cdn, {}, 'get');
    if (!response.status) return response;
    return { status:true, code:200, data:response.data.cdn };
  },

  downloadMP4: async link => {
    if (!link) return { status:false, code:400, error:"Informe o link" };
    if (!savetube.isUrl(link)) return { status:false, code:400, error:"Link inválido" };

    const id = savetube.youtube(link);
    if (!id) return { status:false, code:400, error:"Link YouTube inválido" };

    try {
      const cdnx = await savetube.getCDN();
      if (!cdnx.status) return cdnx;
      const cdn = cdnx.data;

      const result = await savetube.request(`https://${cdn}${savetube.api.info}`, { url: `https://www.youtube.com/watch?v=${id}` });
      if (!result.status) return result;

      const decrypted = await savetube.crypto.decrypt(result.data.data);

      const fmt = decrypted.videoFormats?.[0] || '720';
      const dl = await savetube.request(`https://${cdn}${savetube.api.download}`, { id, downloadType:'video', quality:fmt, key:decrypted.key });

      if (!dl?.status || !dl?.data?.data?.downloadUrl) return { status:false, code:404, error:"MP4 indisponível" };

      return {
        status:true,
        code:200,
        result:{
          title: decrypted.title || "Sem título",
          thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
          id,
          quality: fmt,
          download: dl.data.data.downloadUrl
        }
      }

    } catch(e){ return { status:false, code:500, error:e.message } }
  },

  downloadMP3: async link => {
    if (!link) return { status:false, code:400, error:"Informe o link" };
    if (!savetube.isUrl(link)) return { status:false, code:400, error:"Link inválido" };

    const id = savetube.youtube(link);
    if (!id) return { status:false, code:400, error:"Link YouTube inválido" };

    try {
      const cdnx = await savetube.getCDN();
      if (!cdnx.status) return cdnx;
      const cdn = cdnx.data;

      const result = await savetube.request(`https://${cdn}${savetube.api.info}`, { url: `https://www.youtube.com/watch?v=${id}` });
      if (!result.status) return result;

      const decrypted = await savetube.crypto.decrypt(result.data.data);

      const fmt = 'mp3';
      const dl = await savetube.request(`https://${cdn}${savetube.api.download}`, { id, downloadType:'audio', quality:'128', key:decrypted.key });

      if (!dl?.status || !dl?.data?.data?.downloadUrl) return { status:false, code:404, error:"MP3 indisponível" };

      return {
        status:true,
        code:200,
        result:{
          title: decrypted.title || "Sem título",
          thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
          id,
          format: fmt,
          download: dl.data.data.downloadUrl
        }
      }

    } catch(e){ return { status:false, code:500, error:e.message } }
  }
};

// ===================== Rota MP4 =====================
router.get("/download/mp4", async (req,res)=>{
  const link = req.query.url;
  if(!link) return res.status(400).json({ error:"Parâmetro 'url' é obrigatório" });

  const data = await savetube.downloadMP4(link);
  res.json(data);
});

// ===================== Rota MP3 =====================
router.get("/download/mp3", async (req,res)=>{
  const link = req.query.url;
  if(!link) return res.status(400).json({ error:"Parâmetro 'url' é obrigatório" });

  const data = await savetube.downloadMP3(link);
  res.json(data);
});

// ===================== Rota Search (primeiro resultado MP3) =====================
router.get("/play", async (req,res)=>{
  const query = req.query.q;
  if(!query) return res.status(400).json({ error:"Parâmetro 'q' é obrigatório" });

  try {
    const result = await ytSearch(query);
    const video = result.videos[0];
    if(!video) return res.status(404).json({ error:"Nenhum vídeo encontrado" });

    // Pega MP3 do primeiro resultado
    const data = await savetube.downloadMP3(video.url);

    res.json({
      desenvolvido: "Neext",
      status: true,
      resultado: {
        title: video.title,
        url: video.url,
        thumbnail: video.thumbnail,
        duration: video.timestamp,
        views: video.views,
        author: video.author.name,
        download_mp3: data.result?.download || null
      }
    });

  } catch(err) {
    res.status(500).json({ error:"Erro interno", detalhes: err.message });
  }
});

module.exports = router;