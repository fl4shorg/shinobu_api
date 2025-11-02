// youtube-stalk.js
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

async function getYouTubeStats(channel) {
  try {
    const url = `https://socialblade.com/youtube/handle/${encodeURIComponent(channel)}`;
    const res = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(res.data);

    // imagem e nome
    const profileImg = $("img[alt*='YouTube profile picture']").attr("src");

    // limpa o título (remove "'s YouTube Statistics")
    let channelName = $("meta[property='og:title']").attr("content") || channel;
    channelName = channelName.replace(/'s YouTube Statistics/i, "").trim();

    // pega valores de forma dinâmica
    const getValue = (label) => {
      const labelEl = $(`p.text-sm.font-bold.capitalize:contains('${label}')`);
      return labelEl.next("p.text-sm").text().trim() || "Desconhecido";
    };

    const subscribers = getValue("subscribers");
    const videos = getValue("videos");
    const views = getValue("views");
    const createdOn = getValue("Created On");

    // gera o link oficial do canal
    const youtubeUrl = `https://www.youtube.com/@${channel}`;

    return {
      status: true,
Canal: channelName,
Perfil: profileImg || null,
Inscritos: subscribers,
Vídeos: videos,
Visualizações: views,
CriadoEm: createdOn,
url: youtubeUrl,
    };
  } catch (error) {
    console.error("Erro ao buscar canal:", error.message);
    return {
      status: false,
      message: "Erro ao buscar informações do canal.",
    };
  }
}

// rota express
router.get("/", async (req, res) => {
  const { channel } = req.query;

  if (!channel) {
    return res.status(400).json({
      status: false,
      message: "Parâmetro 'channel' é obrigatório. Ex: /stalk/youtube?channel=felipeneto",
    });
  }

  const result = await getYouTubeStats(channel);
  res.json(result);
});

module.exports = router;