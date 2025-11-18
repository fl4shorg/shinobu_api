const express = require("express");
const router = express.Router();
const axios = require("axios");

// ======================================================
// FUNÇÃO PRINCIPAL — BUSCAR NO APTOIDE
// ======================================================
async function buscarAptoide(query) {
  if (!query) throw new Error("Por favor, insira o nome do aplicativo.");

  const aptoide = await axios.get(
    `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(
      query
    )}&trusted=true`
  );

  if (!aptoide.data?.datalist?.list?.length)
    throw new Error("Nenhum aplicativo encontrado.");

  const appData = aptoide.data.datalist.list[0];
  const appSize = (appData.size / 1048576).toFixed(1);

  // Link encurtado
  const lnDown = await axios.get(
    `https://tinyurl.com/api-create.php?url=${appData.file.path_alt}`
  );

  return {
    nome: appData.name,
    tamanho: `${appSize} MB`,
    desenvolvedor: appData.store.name,
    downloads: appData.stats.downloads,
    link_download: lnDown.data,
    link_original: appData.file.path_alt,
    thumbnail: appData.graphic // << AQUI — LINK DIRETO
  };
}

// ======================================================
// GET /aptoide?search=
// ======================================================
router.get("/", async (req, res) => {
  const { search } = req.query;

  if (!search)
    return res.status(400).json({
      status: false,
      error: "Parâmetro 'search' é obrigatório",
    });

  try {
    const data = await buscarAptoide(search.trim());
    res.json({ status: true, data });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// ======================================================
// POST /aptoide  { "search": "instagram" }
// ======================================================
router.post("/", async (req, res) => {
  const { search } = req.body;

  if (!search)
    return res.status(400).json({
      status: false,
      error: "Parâmetro 'search' é obrigatório",
    });

  try {
    const data = await buscarAptoide(search.trim());
    res.json({ status: true, data });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

module.exports = router;