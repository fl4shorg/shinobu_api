// ff-stalk.js
const express = require("express");
const axios = require("axios");
const { randomUUID } = require("crypto");

const router = express.Router();

async function ffStalk(id) {
  try {
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      "X-Device": randomUUID(),
    };

    // Obter token
    const tokenRes = await axios.post(
      "https://api.duniagames.co.id/api/item-catalog/v1/get-token",
      { msisdn: "0812665588" },
      { headers }
    );
    const tokenData = tokenRes.data;

    if (tokenData.status.code) throw new Error("Falha ao inicializar token");
    const token = tokenData.data.token;

    // Consulta usuário
    const userRes = await axios.post(
      "https://api.duniagames.co.id/api/transaction/v1/top-up/inquiry/store",
      {
        productId: 3,
        itemId: 353,
        product_ref: "REG",
        product_ref_denom: "REG",
        catalogId: 376,
        paymentId: 1252,
        gameId: id,
        token,
        campaignUrl: "",
      },
      { headers }
    );

    const userName = userRes.data.data.gameDetail.userName;

    return {
      status: true,
      id,
      nickname: userName,
    };
  } catch (err) {
    return {
      status: false,
      message: err.message,
    };
  }
}

// Rota para Express
router.get("/stalk/ff", async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ status: false, message: "Informe o ID do usuário" });

  const result = await ffStalk(id);
  res.json(result);
});

module.exports = router;