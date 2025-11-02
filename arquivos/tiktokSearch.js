const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ success: false, message: "Faltando parâmetro: q" });

  try {
    const formData = new URLSearchParams();
    formData.append("keywords", q);
    formData.append("count", "12");
    formData.append("cursor", "0");
    formData.append("web", "1");
    formData.append("hd", "1");

    const response = await axios.post(
      "https://tikwm.com/api/feed/search",
      formData.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "Origin": "https://tikwm.com",
          "Referer": "https://tikwm.com/",
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    );

    const videos = response.data.data.videos || [];
    if (!videos.length) return res.json({ success: false, message: "Nenhum vídeo encontrado" });

    // Mapeia os vídeos para um formato mais limpo
    const result = videos.map(v => ({
      id: v.video_id,
      title: v.title,
      region: v.region,
      duration: v.duration + "s",
      cover: "https://tikwm.com" + v.cover,
      play: "https://tikwm.com" + v.play,
      wmplay: "https://tikwm.com" + v.wmplay,
      size: v.size,
      wm_size: v.wm_size,
      music: {
        id: v.music_info?.id,
        title: v.music_info?.title,
        author: v.music_info?.author,
        play: v.music_info?.play || ("https://tikwm.com" + v.music),
      },
      author: v.author
    }));

    res.json({ success: true, total: result.length, videos: result });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;