const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const cheerio = require('cheerio');

const router = express.Router();

const effectsMap = {
    glitchtext: 'https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html',
    writetext: 'https://en.ephoto360.com/write-text-on-wet-glass-online-589.html',
    advancedglow: 'https://en.ephoto360.com/advanced-glow-effects-74.html',
    typographytext: 'https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html',
    pixelglitch: 'https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html',
    neonglitch: 'https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html',
    flagtext: 'https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html',
    flag3dtext: 'https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html',
    deletingtext: 'https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html',
    blackpinkstyle: 'https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html',
    glowingtext: 'https://en.ephoto360.com/create-glowing-text-effects-online-706.html',
    underwatertext: 'https://en.ephoto360.com/3d-underwater-text-effect-online-682.html',
    logomaker: 'https://en.ephoto360.com/free-bear-logo-maker-online-673.html',
    cartoonstyle: 'https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html',
    papercutstyle: 'https://en.ephoto360.com/multicolor-3d-paper-cut-style-text-effect-658.html',
    watercolortext: 'https://en.ephoto360.com/create-a-watercolor-text-effect-online-655.html',
    effectclouds: 'https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html',
    blackpinklogo: 'https://en.ephoto360.com/create-blackpink-logo-online-free-607.html',
    gradienttext: 'https://en.ephoto360.com/create-3d-gradient-text-effect-online-600.html',
    summerbeach: 'https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html',
    luxurygold: 'https://en.ephoto360.com/create-a-luxury-gold-text-effect-online-594.html',
    multicoloredneon: 'https://en.ephoto360.com/create-multicolored-neon-light-signatures-591.html',
    sandsummer: 'https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html',
    galaxywallpaper: 'https://en.ephoto360.com/create-galaxy-wallpaper-mobile-online-528.html',
    "1917style": 'https://en.ephoto360.com/1917-style-text-effect-523.html',
    makingneon: 'https://en.ephoto360.com/making-neon-light-text-effect-with-galaxy-style-521.html',
    royaltext: 'https://en.ephoto360.com/royal-text-effect-online-free-471.html',
    freecreate: 'https://en.ephoto360.com/free-create-a-3d-hologram-text-effect-441.html',
    galaxystyle: 'https://en.ephoto360.com/create-galaxy-style-free-name-logo-438.html',
    amongustext: 'https://en.ephoto360.com/create-a-cover-image-for-the-game-among-us-online-762.html',
    rainytext: 'https://en.ephoto360.com/foggy-rainy-text-effect-75.html',
    lighteffects: 'https://en.ephoto360.com/create-light-effects-online-410.html',
    shadowtext: 'https://en.ephoto360.com/create-shadow-text-effects-online-458.html',
    neontext: 'https://en.ephoto360.com/create-neon-text-effect-online-482.html',
    firetext: 'https://en.ephoto360.com/create-fire-text-effect-online-502.html',
    ice3dtext: 'https://en.ephoto360.com/create-ice-3d-text-effect-online-496.html',
    gold3dtext: 'https://en.ephoto360.com/create-3d-gold-text-effect-online-508.html'
};

// Função para gerar imagem
async function ephoto(url, textInput) {
    const formData = new FormData();
    const initialResponse = await axios.get(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(initialResponse.data);
    const token = $('input[name=token]').val();
    const buildServer = $('input[name=build_server]').val();
    const buildServerId = $('input[name=build_server_id]').val();

    formData.append('token', token);
    formData.append('build_server', buildServer);
    formData.append('build_server_id', buildServerId);
    formData.append('text[]', textInput);

    const postResponse = await axios({
        url,
        method: 'POST',
        data: formData,
        headers: {
            ...formData.getHeaders(),
            'user-agent': 'Mozilla/5.0',
            'cookie': initialResponse.headers['set-cookie']?.join('; ')
        }
    });

    const $$ = cheerio.load(postResponse.data);
    let formValueInput = JSON.parse($$('input[name=form_value_input]').val());
    formValueInput['text[]'] = formValueInput.text;
    delete formValueInput.text;

    const { data: finalResponseData } = await axios.post(
        'https://en.ephoto360.com/effect/create-image',
        new URLSearchParams(formValueInput),
        { headers: { 'user-agent': 'Mozilla/5.0', 'cookie': initialResponse.headers['set-cookie'].join('; ') } }
    );

    return buildServer + finalResponseData.image;
}

// 🔥 Rota: /ephoto/:effect?text=SeuTexto
router.get('/:effect', async (req, res) => {
    const { effect } = req.params;
    const text = req.query.text;

    if (!text) return res.status(400).send('❌ Parâmetro "text" é obrigatório.');

    const url = effectsMap[effect.toLowerCase()];
    if (!url) return res.status(404).send('❌ Efeito não encontrado.');

    try {
        const imageUrl = await ephoto(url, text);
        const response = await axios.get(imageUrl, { responseType: 'stream' });
        res.setHeader('Content-Type', 'image/jpeg');
        response.data.pipe(res);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao gerar imagem: ' + err.message);
    }
});

// Página inicial listando efeitos
router.get('/', (req, res) => {
    let html = `<h1>🎨 Teste de efeitos ephoto360</h1><ul>`;
    for (const key of Object.keys(effectsMap)) {
        html += `<li><a href="/ephoto/${key}?text=Hello%20World" target="_blank">${key}</a></li>`;
    }
    html += `</ul>`;
    res.send(html);
});

module.exports = router;
module.exports.ephoto = ephoto;