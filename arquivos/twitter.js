const express = require("express");
const axios = require("axios");
const qs = require("qs");

const twitter = express.Router();

twitter.get("/", async (req, res) => {
  try {
    const tweetUrl = req.query.url;
    if (!tweetUrl) {
      return res.status(400).json({ success: false, message: "Parâmetro ?url= obrigatório" });
    }

    // === 1. Pegar token ===
    const tokenRes = await axios.post(
      "https://x2twitter.com/api/userverify",
      qs.stringify({ url: tweetUrl }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Accept: "*/*",
          "X-Requested-With": "XMLHttpRequest"
        }
      }
    );
    const cftoken = tokenRes.data.token;

    // === 2. Buscar HTML com token ===
    const htmlRes = await axios.post(
      "https://x2twitter.com/api/ajaxSearch",
      qs.stringify({ q: tweetUrl, lang: "id", cftoken }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Accept: "*/*",
          "X-Requested-With": "XMLHttpRequest"
        }
      }
    );

    const html = htmlRes.data.data;

    // === 3. Extrair dados ===
    const thumbnail = html.match(/<img[^>]+src="([^"]+)"/)?.[1] || null;
    const downloads = [...html.matchAll(/<a[^>]+href="(https:\/\/dl\.snapcdn\.app\/get\?token=[^"]+)"[^>]*>(.*?)<\/a>/gs)]
      .map(m => {
        const label = m[2].replace(/<[^>]+>/g, "").trim();
        return { label, url: m[1].trim() };
      })
      .filter(x => x.label.toLowerCase().includes("mp4"));

    const audioUrl = html.match(/data-audioUrl="([^"]+)"/)?.[1];
    const v_id = html.match(/data-mediaId="([^"]+)"/)?.[1];
    const exp = html.match(/k_exp\s*=\s*"([^"]+)"/)?.[1];
    const token = html.match(/k_token\s*=\s*"([^"]+)"/)?.[1];

    // === 4. Converter para MP3 ===
    const mp3Res = await axios.post(
      "https://s1.twcdn.net/api/json/convert",
      qs.stringify({
        ftype: "mp3",
        v_id,
        audioUrl,
        audioType: "video/mp4",
        fquality: "128",
        fname: "X2Twitter.com",
        exp,
        token
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Accept: "*/*"
        }
      }
    );

    const mp3 = mp3Res.data;

    // === 5. Resultado final ===
    const result = {
      thumbnail,
      mp3: {
        url: mp3.result,
        quality: mp3.fileSize
      },
      videos: downloads
    };

    res.json({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao processar o vídeo" });
  }
});

module.exports = twitter;