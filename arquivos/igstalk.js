const axios = require('axios');

class IGStalk {
    constructor(isDebug = false) {
        this.isDebug = isDebug;
    }

    log = (text) => {
        if (this.isDebug) console.log('[IGStalk]', text);
    }

    // Handler para app.use
    handler = async (req, res) => {
        try {
            const username = req.query.username;
            if (!username) return res.status(400).json({ error: 'Username é obrigatório' });

            this.log(`Buscando dados do Instagram para: ${username}`);

            // Requisições simultâneas
            const [profileResp, storiesResp, postsResp] = await Promise.all([
                axios.post('https://free-tools-api.vercel.app/api/instagram-profile', { username }),
                axios.post('https://free-tools-api.vercel.app/api/instagram-viewer', { username, type: 'stories' }),
                axios.post('https://free-tools-api.vercel.app/api/instagram-viewer', { username, type: 'photo' })
            ]);

            const result = {
                profile_info: profileResp.data || {},
                stories: storiesResp.data?.stories || [],
                latest_posts: postsResp.data?.posts || []
            };

            this.log(`Dados obtidos com sucesso para: ${username}`);
            return res.json(result);

        } catch (error) {
            console.error('[IGStalk ERROR]', error.message);
            return res.status(500).json({ error: 'Falha ao obter dados do Instagram', details: error.message });
        }
    }
}

// Exporta diretamente o handler já instanciado
module.exports = new IGStalk(true).handler;