/*
 * Apple Music Downloader + Search API + PlayAppleMusic (versão 2025)
 * Nova API: https://theresapis.vercel.app
 * Adaptado por Flash ⚡ (corrigido: extrai result.url e result.thumbnail)
 */

const express = require("express");
const axios = require("axios");

const router = express.Router();

// Função robusta para pegar dados de download da Theresa API
async function getAppleMusic(url) {
  const endpoint = "https://theresapis.vercel.app/download/applemusic";

  // helper para processar a resposta e extrair os campos esperados
  const parseResponse = (data) => {
    if (!data) return null;

    // Se existe um objeto "result" (ex: seu exemplo), prioriza ele
    const result = data.result || data.data || null;

    // possíveis locais do link de áudio
    const audioCandidates = [
      result?.url,
      data?.url,
      data?.audio,
      data?.mp3,
      result?.audio,
      result?.audio_url,
      result?.audioUrl
    ];

    const audio = audioCandidates.find((x) => typeof x === "string" && x.startsWith("http")) || null;

    // artwork / thumbnail
    const artwork =
      result?.thumbnail ||
      result?.cover ||
      data?.cover ||
      data?.thumbnail ||
      data?.artwork ||
      null;

    const title = result?.name || result?.title || data?.title || null;
    const artist = result?.artist || data?.artist || null;
    const album = result?.album_name || result?.album || data?.album || null;
    const pageUrl = result?.page || data?.url || null;

    return {
      audio,
      artwork,
      title,
      artist,
      album,
      pageUrl
    };
  };

  // tentativa 1: chamar com params (mais comum)
  try {
    const resp = await axios.get(endpoint, {
      params: { url },
      headers: { accept: "*/*" },
      timeout: 12000
    });
    const parsed = parseResponse(resp.data);
    if (parsed && parsed.audio) return parsed;
    // se não encontrou áudio, mas a resposta existe, ainda retornamos parsed (p/ debug downstream)
    if (parsed) return parsed;
  } catch (err) {
    // console.warn("getAppleMusic tentativa 1 falhou:", err.message);
  }

  // tentativa 2: usar query string já codificada (algumas APIs precisam)
  try {
    const encoded = encodeURIComponent(url);
    const fetchUrl = `${endpoint}?url=${encoded}`;
    const resp2 = await axios.get(fetchUrl, { headers: { accept: "*/*" }, timeout: 12000 });
    const parsed2 = parseResponse(resp2.data);
    if (parsed2 && parsed2.audio) return parsed2;
    if (parsed2) return parsed2;
  } catch (err) {
    // console.warn("getAppleMusic tentativa 2 falhou:", err.message);
  }

  // tentativa 3: chamar endpoint diretamente concatenando sem params (menos provável, mas tentativa extra)
  try {
    const fetchUrl = `${endpoint}/${encodeURIComponent(url)}`;
    const resp3 = await axios.get(fetchUrl, { headers: { accept: "*/*" }, timeout: 12000 });
    const parsed3 = parseResponse(resp3.data);
    if (parsed3 && parsed3.audio) return parsed3;
    if (parsed3) return parsed3;
  } catch (err) {
    // console.warn("getAppleMusic tentativa 3 falhou:", err.message);
  }

  // se chegar aqui, não foi possível obter o link
  throw new Error("Não foi possível obter link de download da Theresa API (verifique a url enviada).");
}

// Rota /apple (download pelo link)
router.get("/", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.json({ error: "Use: /apple?url=<link-do-apple-music>" });

    const info = await getAppleMusic(url);

    res.json({
      status: true,
      title: info.title || null,
      artist: info.artist || null,
      album: info.album || null,
      artwork: info.artwork || null,
      url: info.pageUrl || null,
      mp3: info.audio || null
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Rota /apple/search (buscar música pelo nome)
router.get("/search", async (req, res) => {
  try {
    const { term } = req.query;
    if (!term) return res.json({ error: "Use: /apple/search?term=<nome-da-musica>" });

    const query = encodeURIComponent(term);
    const url = `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`;

    const response = await axios.get(url);
    const results = response.data.results;

    if (!results || results.length === 0) return res.json({ status: false, message: "Nenhuma música encontrada." });

    const song = results[0];

    res.json({
      status: true,
      artist: song.artistName,
      track: song.trackName,
      album: song.collectionName,
      preview: song.previewUrl,
      artwork: song.artworkUrl100,
      trackView: song.trackViewUrl
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Rota /apple/play → busca + download automático (preenche download com result.url quando disponível)
router.get("/play", async (req, res) => {
  try {
    const { term } = req.query;
    if (!term) return res.json({ error: "Use: /apple/play?term=<nome-da-musica>" });

    // Pesquisa na iTunes API
    const query = encodeURIComponent(term);
    const searchUrl = `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`;
    const searchResponse = await axios.get(searchUrl);
    const results = searchResponse.data.results;

    if (!results || results.length === 0) return res.json({ status: false, message: "Nenhuma música encontrada." });

    const song = results[0];

    // Tenta obter download via Theresa API usando a trackViewUrl (ou outra URL disponível)
    let downloadInfo = null;
    const tryUrls = [song.trackViewUrl, song.trackView, song.trackHref, song.collectionViewUrl].filter(Boolean);

    for (const u of tryUrls.length ? tryUrls : [song.trackViewUrl]) {
      try {
        downloadInfo = await getAppleMusic(u);
        if (downloadInfo && downloadInfo.audio) break; // achou link válido
      } catch (e) {
        // tentar próximo fallback
        downloadInfo = downloadInfo || null;
      }
    }

    const downloadField = downloadInfo
      ? { mp3: downloadInfo.audio || null, cover: downloadInfo.artwork || null, page: downloadInfo.pageUrl || null }
      : {};

    const responsePayload = {
      status: true,
      artist: song.artistName,
      track: song.trackName,
      album: song.collectionName,
      preview: song.previewUrl,
      artwork: song.artworkUrl100,
      trackView: song.trackViewUrl,
      download: downloadField
    };

    if (!downloadInfo || !downloadInfo.audio) {
      responsePayload.note = "Não foi possível obter link de download automaticamente. Tente usar /apple?url=<trackViewUrl> para forçar o download.";
    }

    res.json(responsePayload);
  } catch (err) {
    res.json({ error: err.message });
  }
});

module.exports = router;