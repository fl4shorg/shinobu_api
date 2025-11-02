const express = require("express");
const fetch = require("node-fetch"); // se usar node >=18 pode usar global fetch — substitua se necessário
const router = express.Router();

/**
 * GET  /api/tools/skiplink?url=...
 * POST /api/tools/skiplink  { "url": "..." }
 *
 * Este arquivo tenta:
 * 1) usar um solver Turnstile se disponível em req.app.locals.solveBypass ou req.solveBypass
 * 2) enviar token no header "token" para api2.bypass.city
 * 3) retornar erro 403 com explicação se não for possível obter token
 */

function getUrlFromReq(req) {
  const url = req.method === "GET" ? req.query.url : req.body && req.body.url;
  return url;
}

async function requestBypassCity(urlToBypass, token) {
  const endpoint = "https://api2.bypass.city/bypass";

  const headers = {
    "content-type": "application/json",
    origin: "https://bypass.city",
    referer: "https://bypass.city/",
    "user-agent":
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
    "x-captcha-provider": "TURNSTILE",
  };

  if (token) {
    headers["token"] = token;
  }

  const resp = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ url: urlToBypass }),
    // timeout handling can be added por axios/fetch wrapper se quiser
  });

  const text = await resp.text(); // ler texto pra debugging se json falhar
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (e) {
    // mantemos o texto bruto em caso de falha
  }

  return {
    ok: resp.ok,
    status: resp.status,
    statusText: resp.statusText,
    headers: Object.fromEntries(resp.headers.entries ? resp.headers.entries() : []),
    bodyText: text,
    bodyJson: json,
  };
}

async function obtainToken(req) {
  // Estratégia: procurar uma função solveBypass em vários lugares convenientes.
  // O usuário/infra deve disponibilizar uma função que retorne um objeto com método solveTurnstileMin(domain, sitekey)
  // e que entregue o token (string).
  const maybe = req.solveBypass || (req.app && req.app.locals && req.app.locals.solveBypass);
  if (!maybe) return null;

  // Se solveBypass for uma função que retorna/resolve um objeto
  try {
    const bypass = await maybe(); // pode ser async
    if (!bypass) return null;

    // Usamos site e sitekey do exemplo. Se a tua infra usa outro sitekey, ajuste aqui.
    if (typeof bypass.solveTurnstileMin === "function") {
      const token = await bypass.solveTurnstileMin("https://bypass.city/", "0x4AAAAAAAGzw6rXeQWJ_y2P");
      return token;
    }

    // Se a função já devolve diretamente o token string:
    if (typeof bypass === "string") return bypass;

    return null;
  } catch (err) {
    // não falhar de maneira obscura — devolve null para que chamador trate
    console.error("obtainToken error:", err && err.message ? err.message : err);
    return null;
  }
}

async function handleBypassRequest(req, res) {
  const rawUrl = getUrlFromReq(req);
  if (!rawUrl) return res.status(400).json({ status: false, error: "Campo 'url' é obrigatório." });

  const url = String(rawUrl).trim();
  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ status: false, error: "Formato de URL inválido." });
  }

  // Tentar obter token Turnstile (se houver solver configurado)
  const token = await obtainToken(req);

  // Se não pegou token, tentaremos chamar sem token — mas provavelmente dará 403.
  // Chamamos primeiro com token (se existir), se der 403 e não havia token, retornamos instrução.
  try {
    const attempt = await requestBypassCity(url, token);

    // Caso sucesso (2xx)
    if (attempt.ok) {
      return res.json({
        status: true,
        data: attempt.bodyJson ?? attempt.bodyText,
        originalUrl: url,
        usedToken: !!token,
        timestamp: new Date().toISOString(),
      });
    }

    // Se recebemos 403 e não passamos token, informamos que é provavelmente por falta do token.
    if (attempt.status === 403) {
      const msg = token
        ? "403 Forbidden recebido mesmo após enviar token — o token pode ser inválido ou IP bloqueado."
        : "403 Forbidden: o servidor exige token (Turnstile). Configure uma função solveBypass e passe-a em req.app.locals.solveBypass ou req.solveBypass para gerar o token automaticamente.";

      return res.status(403).json({
        status: false,
        error: msg,
        details: {
          status: attempt.status,
          statusText: attempt.statusText,
          bodyText: attempt.bodyText,
        },
        guidance:
          "Se tiver um solver Turnstile, certifique-se que ele retorne um token válido. Se não, configure um solver (headless/challenge solver) ou use um serviço que resolva Turnstile.",
      });
    }

    // Outros erros (4xx/5xx) — encaminhar detalhes para debugging
    return res.status(attempt.status || 500).json({
      status: false,
      error: `Bypass.city API error: ${attempt.status} ${attempt.statusText}`,
      details: {
        bodyText: attempt.bodyText,
      },
    });
  } catch (err) {
    console.error("Erro requestBypassCity:", err);
    return res.status(500).json({ status: false, error: "Erro interno ao contatar bypass.city", message: err.message || String(err) });
  }
}

// GET
router.get("/", async (req, res) => {
  await handleBypassRequest(req, res);
});

// POST
router.post("/", async (req, res) => {
  await handleBypassRequest(req, res);
});

module.exports = router;