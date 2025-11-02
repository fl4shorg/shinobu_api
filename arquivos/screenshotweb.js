//――――――――――――――――――――――――――――――――――――――――――
// 📸 screenshotweb.js - Captura de tela de sites
//――――――――――――――――――――――――――――――――――――――――――

const express = require("express");
const axios = require("axios");

const router = express.Router();

/**
 * Função de captura usando ScreenshotMachine
 */
async function ssweb(url, device = "desktop") {
  const base = "https://www.screenshotmachine.com";
  const params = {
    url: url,
    device: device,
    cacheLimit: 0,
  };

  const { data, headers } = await axios({
    url: base + "/capture.php",
    method: "POST",
    data: new URLSearchParams(Object.entries(params)),
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
  });

  const cookies = headers["set-cookie"];

  if (data.status === "success") {
    const response = await axios.get(base + "/" + data.link, {
      headers: { cookie: cookies ? cookies.join("") : "" },
      responseType: "arraybuffer",
    });

    return {
      status: 200,
      buffer: response.data,
    };
  } else {
    throw {
      status: 404,
      message: data,
    };
  }
}

/**
 * Rota GET: /ssweb?url=&device=
 */
router.get("/ssweb", async (req, res) => {
  const { url, device } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Faltando parâmetro ?url=" });
  }

  try {
    const result = await ssweb(url, device || "desktop");
    res.setHeader("Content-Type", "image/png");
    res.send(result.buffer);
  } catch (error) {
    console.error("Erro:", error);
    res
      .status(500)
      .json({ error: "Erro ao gerar screenshot", detalhe: error.message });
  }
});

module.exports = router;