const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { judul, artis, cover } = req.query;

    const finalUrl =
      `https://neextltda-canvas-api.hf.space/musicardiphone` +
      `?judul=${encodeURIComponent(judul || "")}` +
      `&artis=${encodeURIComponent(artis || "")}` +
      `&cover=${encodeURIComponent(cover || "")}`;

    const { data, headers } = await axios.get(finalUrl, {
      responseType: "stream"
    });

    res.setHeader("Content-Type", headers["content-type"] || "image/png");

    data.pipe(res);

  } catch (e) {
    res.status(500).json({
      status: false,
      error: e.message
    });
  }
});

module.exports = router;