// textpro.js
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const Base64 = require("crypto-js/enc-base64");
const Utf8 = require("crypto-js/enc-utf8");
const qs = require("qs");
const FormData = require("form-data");
const Uri = require("uri-js");
const cookie = require("cookie");

const router = express.Router();

// === Lista extensa de efeitos famosos do textpro.me ===
const effects = {
  neon: "https://textpro.me/create-neon-devil-wings-text-effect-online-free-1014.html",
  frozen: "https://textpro.me/create-realistic-3d-text-effect-frozen-winter-1099.html",
  deadpool: "https://textpro.me/create-deadpool-logo-style-text-effect-online-1159.html",
  pornhub: "https://textpro.me/pornhub-style-logo-online-generator-977.html",
  matrix: "https://textpro.me/matrix-style-text-effect-online-884.html",
  thor: "https://textpro.me/create-thor-logo-style-text-effect-online-1064.html",
  pokemon: "https://textpro.me/create-pokemon-logo-style-text-effect-online-1134.html",
  batman: "https://textpro.me/make-a-batman-logo-online-free-1066.html",
  greenhorror: "https://textpro.me/create-green-horror-style-text-effect-online-1036.html",
  magma: "https://textpro.me/create-a-magma-hot-text-effect-online-1030.html",
  harrypotter: "https://textpro.me/create-harry-potter-text-effect-online-1025.html",
  glowing: "https://textpro.me/glowing-text-effect-online-879.html",
  marvel: "https://textpro.me/create-logo-style-marvel-studios-online-971.html",
  marvel: "https://textpro.me/create-logo-style-marvel-studios-online-971.html",
  glitch: "https://textpro.me/create-impressive-glitch-text-effects-online-1027.html",
  horror: "https://textpro.me/horror-text-effect-online-883.html",
  bearlogo: "https://textpro.me/online-black-and-white-bear-mascot-logo-creation-1012.html",
  graffiti: "https://textpro.me/create-wolf-metal-graffiti-text-effect-online-994.html",
  thunder: "https://textpro.me/create-thunder-text-effect-online-881.html",
  sketch: "https://textpro.me/create-sketch-text-effect-online-984.html",
  threeDchrome: "https://textpro.me/3d-chrome-text-effect-online-1084.html",
  gold: "https://textpro.me/gold-text-effect-online-874.html",
  candy: "https://textpro.me/candy-text-effect-online-872.html",
  naruto: "https://textpro.me/naruto-logo-online-generator-1002.html",
  blackpink: "https://textpro.me/blackpink-logo-maker-online-1001.html",
  stone: "https://textpro.me/create-stone-text-effect-online-988.html",
  water: "https://textpro.me/create-3d-water-text-effect-online-1011.html",
  metal: "https://textpro.me/create-metal-text-effect-online-989.html",
  lava: "https://textpro.me/lava-text-effect-online-965.html",
  juice: "https://textpro.me/fruit-juice-text-effect-online-986.html",
  galaxy: "https://textpro.me/galaxy-text-effect-860.html",
  plasma: "https://textpro.me/create-plasma-text-effect-online-1012.html",
  transformer: "https://textpro.me/transformer-text-effect-online-1023.html",
  neon2: "https://textpro.me/neon-text-effect-online-883.html",
  logoteste: "https://textpro.me/create-neon-devil-wings-text-effect-online-free-1014.html"
};

// === Helper para retornar imagem ===
function createImageResponse(buffer, filename = null, res) {
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Length", buffer.length);
  res.setHeader("Cache-Control", "public, max-age=3600");
  if (filename) res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  res.send(buffer);
}

// === Classe para burlar reCAPTCHA ===
class RecaptchaBypass {
  constructor({ url, key }) {
    this.url = url;
    this.key = key;
  }

  async getCaptchaToken() {
    try {
      const uri = Uri.parse(this.url);
      if (!uri.scheme || !uri.host) throw new Error("Invalid URL for reCAPTCHA");
      const domain = Base64.stringify(Utf8.parse(`${uri.scheme}://${uri.host}:443`)).replace(/=/g, ".");

      const recaptchaOut = await axios.get(`https://www.google.com/recaptcha/api.js?render=${this.key}`);
      const vToken = recaptchaOut.data.substring(
        recaptchaOut.data.indexOf("/releases/") + 10,
        recaptchaOut.data.indexOf("/recaptcha__en.js")
      );

      const anchorOut = await axios.get(
        `https://www.google.com/recaptcha/api2/anchor?ar=1&hl=en&size=invisible&cb=flicklax&k=${this.key}&co=${domain}&v=${vToken}`
      );
      const $ = cheerio.load(anchorOut.data);
      const recaptchaToken = $("#recaptcha-token").attr("value");
      if (!recaptchaToken) throw new Error("Failed to extract recaptcha-token");

      const data = { v: vToken, reason: "q", k: this.key, c: recaptchaToken, sa: "", co: domain };

      const tokenOut = await axios.post(
        `https://www.google.com/recaptcha/api2/reload?k=${this.key}`,
        qs.stringify(data),
        { headers: { referer: "https://www.google.com/recaptcha/api2/" } }
      );

      const tokenMatch = tokenOut.data.match(/"rresp","(.+?)"/);
      if (!tokenMatch) throw new Error("Failed to extract reCAPTCHA response token");

      return { token: tokenMatch[1] };
    } catch (err) {
      throw new Error("reCAPTCHA bypass failed: " + err.message);
    }
  }
}

// === Pega buffer da URL ===
async function getBuffer(url, headers = {}) {
  const response = await axios.get(url, { headers, responseType: "arraybuffer" });
  return Buffer.from(response.data);
}

// === Valida quantidade de inputs ===
async function validateTextInputs(url, texts) {
  const initialResponse = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const html = initialResponse.data;
  const $ = cheerio.load(html);
  const textInputs = $('input[name="text[]"]').length;

  if (texts.length !== textInputs) {
    throw new Error(`This effect requires exactly ${textInputs} text input(s), but ${texts.length} provided`);
  }

  const setCookieHeader = initialResponse.headers["set-cookie"];
  const cookies = setCookieHeader ? (Array.isArray(setCookieHeader) ? setCookieHeader.join(", ") : setCookieHeader) : null;
  return { html, cookies };
}

// === Função principal ===
async function textpro(url, texts) {
  if (typeof texts === "string") texts = [texts];
  const { html, cookies } = await validateTextInputs(url, texts);
  if (!cookies) throw new Error("No cookies received");

  const parsedCookies = {};
  const cookieHeaders = Array.isArray(cookies) ? cookies : [cookies];
  cookieHeaders.forEach((cookieHeader) => {
    cookieHeader.split(",").forEach((c) => {
      const mainCookie = c.split(";")[0].trim();
      if (mainCookie.includes("=")) Object.assign(parsedCookies, cookie.parse(mainCookie));
    });
  });
  const cookieString = Object.entries(parsedCookies).map(([n, v]) => `${n}=${v}`).join("; ");

  const $ = cheerio.load(html);
  const token = $('input[name="token"]').attr("value");
  if (!token) throw new Error("Token not found in initial page");

  const recaptcha = new RecaptchaBypass({ url: "https://textpro.me", key: "6LdoRvwpAAAAAErCE_lfjtk05CMJFA-jCSJsEhxf" });
  const { token: recaptchaToken } = await recaptcha.getCaptchaToken();

  const formData = new FormData();
  texts.forEach((t) => formData.append("text[]", t));
  formData.append("grecaptcharesponse", recaptchaToken);
  formData.append("g-recaptcha-response", recaptchaToken);
  formData.append("token", token);
  formData.append("build_server", "https://textpro.me");
  formData.append("build_server_id", "1");

  const formResponse = await axios.post(url, formData, {
    headers: { "User-Agent": "Mozilla/5.0", Origin: "https://textpro.me", Referer: url, Cookie: cookieString, ...formData.getHeaders() }
  });

  const formHtml = formResponse.data;
  const formValueMatch = /<div.*?id="form_value".*?>(.*?)<\/div>/s.exec(formHtml);
  if (!formValueMatch) throw new Error("Form value not found");

  let formValue;
  try { formValue = JSON.parse(formValueMatch[1]); } catch { throw new Error("Failed to parse form value JSON"); }

  const imageResponse = await axios.post("https://textpro.me/effect/create-image", qs.stringify(formValue), {
    headers: { "User-Agent": "Mozilla/5.0", "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", Origin: "https://textpro.me", Referer: url, Cookie: cookieString, "X-Requested-With": "XMLHttpRequest" }
  });

  const result = imageResponse.data;
  if (!result.fullsize_image) throw new Error("Failed to get image URL from response");

  const imageUrl = `https://textpro.me${result.fullsize_image}`;
  return await getBuffer(imageUrl, { "User-Agent": "Mozilla/5.0" });
}

// === Rotas Express corrigidas ===
router.get("/api/efeito/textpro/:effect", async (req, res) => {
  const { effect } = req.params; // efeito vem da rota
  const { text1, text2 } = req.query; // textos na query
  if (!effect || !text1) return res.status(400).json({ status: false, error: "Missing required parameters" });

  const url = effects[effect.toLowerCase()];
  if (!url) return res.status(400).json({ status: false, error: "Effect not found" });

  const texts = text2 ? [text1, text2] : [text1];
  try {
    const buffer = await textpro(url, texts);
    createImageResponse(buffer, `${effect}.png`, res);
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

router.post("/api/m/textpro/:effect", async (req, res) => {
  const { effect } = req.params;
  const { text1, text2 } = req.body;
  if (!effect || !text1) return res.status(400).json({ status: false, error: "Missing required parameters" });

  const url = effects[effect.toLowerCase()];
  if (!url) return res.status(400).json({ status: false, error: "Effect not found" });

  const texts = text2 ? [text1, text2] : [text1];
  try {
    const buffer = await textpro(url, texts);
    createImageResponse(buffer, `${effect}.png`, res);
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

module.exports = router;