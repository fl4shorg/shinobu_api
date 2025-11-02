// arquivos/bratvideo.js
const express = require("express");
const axios = require("axios");

const router = express.Router();

/**
 * Rota: /bratvideo?text=seu texto com espaços
 * Exemplo:
 *   http://localhost:3000/bratvideo?text=flash%20flash
 */
router.get("/bratvideo", async (req, res) => {
  const { text } = req.query;

  if (!text) {
    return res.status(400).json({ error: "Parâmetro obrigatório: ?text=" });
  }

  try {
    // Monta URL: a API espera espaços codificados (encodeURIComponent faz isso)
    const apiUrl = `https://api.ypnk.dpdns.org/api/video/bratv?text=${encodeURIComponent(text)}`;

    // Primeiro tenta pegar direto em stream (muitos endpoints retornam stream direto)
    let apiResp;
    try {
      apiResp = await axios.get(apiUrl, { responseType: "stream", validateStatus: null });
    } catch (err) {
      // se falhar no stream direto, vamos tentar em JSON abaixo
      apiResp = null;
    }

    // Se a resposta veio como stream e tem content-type de vídeo, repassa direto
    if (apiResp && apiResp.headers && apiResp.headers["content-type"] && apiResp.headers["content-type"].startsWith("video")) {
      res.setHeader("Content-Type", apiResp.headers["content-type"]);
      return apiResp.data.pipe(res);
    }

    // Se a resposta não foi stream de vídeo, tenta buscar como JSON (GET normal sem stream)
    const jsonResp = await axios.get(apiUrl).catch(() => null);

    if (!jsonResp || !jsonResp.data) {
      return res.status(502).json({ error: "Resposta inesperada da API externa." });
    }

    // Se a API retornou JSON com link do vídeo (verifica campos comuns)
    const data = jsonResp.data;
    const videoUrl = data.result || data.url || data.download || data.data || null;

    // Se o campo capturado é um objeto contendo link:
    let resolvedVideoUrl = null;
    if (typeof videoUrl === "string") {
      resolvedVideoUrl = videoUrl;
    } else if (videoUrl && typeof videoUrl === "object") {
      // tenta encontrar um valor string dentro do objeto
      for (const k of ["url", "link", "video", "result"]) {
        if (videoUrl[k] && typeof videoUrl[k] === "string") {
          resolvedVideoUrl = videoUrl[k];
          break;
        }
      }
    }

    if (!resolvedVideoUrl) {
      // se não encontramos link, tenta procurar qualquer string no JSON que pareça uma URL
      const findUrlInObject = (obj) => {
        if (!obj) return null;
        if (typeof obj === "string" && (obj.startsWith("http://") || obj.startsWith("https://"))) return obj;
        if (typeof obj === "object") {
          for (const k in obj) {
            const v = findUrlInObject(obj[k]);
            if (v) return v;
          }
        }
        return null;
      };
      resolvedVideoUrl = findUrlInObject(data);
    }

    if (!resolvedVideoUrl) {
      return res.status(404).json({
        error: "Vídeo não encontrado na resposta da API externa.",
        resposta_da_api: data
      });
    }

    // Agora baixa o vídeo do resolvedVideoUrl como stream e reencaminha
    const videoStreamResp = await axios.get(resolvedVideoUrl, { responseType: "stream" });

    const contentType = videoStreamResp.headers["content-type"] || "application/octet-stream";
    res.setHeader("Content-Type", contentType);

    // Sugestão de nome de arquivo pro download (opcional)
    if (contentType.startsWith("video")) {
      res.setHeader("Content-Disposition", 'inline; filename="bratvideo.mp4"');
    }

    videoStreamResp.data.pipe(res);
  } catch (err) {
    console.error("Erro em /bratvideo:", err?.message || err);
    // se der erro de stream grande, enviar mensagem
    res.status(500).json({ error: "Falha ao gerar/encaminhar o vídeo.", detalhe: err?.message || String(err) });
  }
});

module.exports = router;