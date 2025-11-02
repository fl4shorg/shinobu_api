const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

class SnackVideo {
    // Pesquisa vídeos e já retorna link de download
    search = async function search(q) {
        return new Promise(async (resolve, reject) => {
            try {
                const { data } = await axios.get("https://www.snackvideo.com/discover/" + q);
                const $ = cheerio.load(data);
                const content = $("#ItemList").text().trim();
                if (!content) return reject({ msg: "Vídeo não encontrado!" });

                const json = JSON.parse(content);
                const result = await Promise.all(json.map(async (a) => {
                    const videoUrl = a.innerHTML.contentUrl || null; // se já tiver, usa
                    // Se não tiver, faz uma requisição rápida pra pegar
                    let downloadLink = videoUrl;
                    if (!downloadLink) {
                        try {
                            const { data: videoPage } = await axios.get(a.innerHTML.url);
                            const _$ = cheerio.load(videoPage);
                            const videoJson = JSON.parse(_$("#VideoObject").text().trim());
                            downloadLink = videoJson.contentUrl;
                        } catch (err) {
                            downloadLink = null;
                        }
                    }
                    return {
                        title: a.innerHTML.name,
                        thumbnail: a.innerHTML.thumbnailUrl[0],
                        uploaded: new Date(a.innerHTML.uploadDate).toLocaleString(),
                        stats: {
                            watch: a.innerHTML.interactionStatistic[0].userInteractionCount,
                            likes: a.innerHTML.interactionStatistic[1].userInteractionCount,
                            comment: a.innerHTML.commentCount,
                            share: a.innerHTML.interactionStatistic[2].userInteractionCount,
                        },
                        author: {
                            name: a.innerHTML.creator.mainEntity.name,
                            alt_name: a.innerHTML.creator.mainEntity.alternateName,
                            bio: a.innerHTML.creator.mainEntity.description,
                            avatar: a.innerHTML.creator.mainEntity.image,
                            stats: {
                                likes: a.innerHTML.creator.mainEntity.interactionStatistic[0].userInteractionCount,
                                followers: a.innerHTML.creator.mainEntity.interactionStatistic[1].userInteractionCount
                            }
                        },
                        url: a.innerHTML.url,
                        download: downloadLink
                    };
                }));
                resolve(result);
            } catch (error) {
                reject({ msg: error.message });
            }
        });
    }

    // Download direto (envia o vídeo)
    download = async function download(url) {
        return new Promise(async (resolve, reject) => {
            try {
                const { data } = await axios.get(url);
                const $ = cheerio.load(data);
                const json = JSON.parse($("#VideoObject").text().trim());
                resolve(json.contentUrl); // retorna apenas a URL do vídeo
            } catch (error) {
                reject({ msg: error.message });
            }
        });
    }
}

const snack = new SnackVideo();

// Rota de pesquisa
router.get("/search", async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ msg: "Query 'q' é obrigatória" });

    try {
        const results = await snack.search(query);
        res.json(results);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Rota de download direto
router.get("/download", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ msg: "Query 'url' é obrigatória" });

    try {
        const videoUrl = await snack.download(url);

        // Faz o download do vídeo e envia como arquivo
        const response = await axios.get(videoUrl, { responseType: "stream" });
        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Content-Disposition", "attachment; filename=video.mp4");
        response.data.pipe(res);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;