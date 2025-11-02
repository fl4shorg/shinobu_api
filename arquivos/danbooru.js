// danbooru.js - API completa de imagens aleatórias 2025
const express = require('express');
const axios = require('axios');

const router = express.Router();

// Categorias organizadas
const categorias = {
  safe: [
    "1girl","1boy","2girls","2boys","animal","scenery","original","solo","group","female","male",
    "long_hair","short_hair","smile","blush","happy","sad","angry","cosplay","uniform",
    "school_uniform","maid","nurse","witch","armor","sword","gun","magic","fantasy",
    "robot","cyberpunk","steampunk","vampire","demon","angel","ghost","halloween",
    "christmas","summer","beach","winter","snow","autumn","rain","flower","tree",
    "forest","mountain","city","building","street","night","sunset","sunrise","clouds",
    "sky","moon","stars","river","lake","ocean","train","car","bike","school","classroom",
    "library","room","bed","chair","table","food","drink","coffee","tea","cake","chocolate",
    "fruit","genshin_impact","naruto","one_piece","attack_on_titan","my_hero_academia",
    "demon_slayer","spy_x_family","jojo","dragon_ball","bleach","tokyo_revengers",
    "idol","concert","stage","music","guitar","piano","drums","sports","soccer","basketball",
    "baseball","swimming","running","gym","meditation","yoga","shopping","cityscape","cafe",
    "restaurant","library","office","computer","gaming","anime_convention","festival","travel",
    "roadtrip","train_station","airport","bus_station","mountain_view","beach_sunset","river_view",
    "night_sky","starscape","cloudy_sky","sunrise_view","sunset_view","flowers_field","cherry_blossom",
    "autumn_leaves","snowy_forest","desert","jungle","lake_view","waterfall","island","castle",
    "temple","shrine","statue","bridge","street_lamp","city_night","window_view","balcony",
    "portrait","selfie","smiling_face","laughing_face","crying_face","angry_face","thinking_face",
    "shy_face","sleeping","reading","writing","drawing","painting","cooking","eating","drinking",
    "coffee_break","tea_time","chocolate_cake","fruit_plate","ice_cream","pizza","hamburger",
    "sushi","ramen","bento","cake_shop","flower_shop","bookstore","school_classroom","laboratory",
    "hospital","nurse_station","police_station","fire_station","train_interior","bus_interior"
  ],
  nsfw: [
    "hentai","yaoi","yuri","bondage","nude","sex","anal","oral","futa","femdom","cum",
    "blowjob","handjob","footjob","panties","bra","lingerie","swimsuit","bikini","dress",
    "skirt","shirt","coat","jacket","glasses","hat","ribbon","necklace","breasts","nipples",
    "ass","thighs","pussy","vaginal","cumshot","masturbation","lactation","oral_sex",
    "sex_toy","fisting","double_penetration","group_sex","bdsm","tanlines","nip_slip",
    "bondage_solo","bondage_group","dominant","submissive","massage","strip","naked_play",
    "glasses_remove","shirt_lift","panties_pull","stockings","corset","gag","whip","handcuffs",
    "tentacle","anal_fisting","double_cumshot","face_sitting","creampie","orgy","threesome",
    "foursome","group_play","teacher_student","maid_nsfw","school_uniform_nsfw","swimsuit_nsfw",
    "bikini_nsfw","yuri_anal","yaoi_anal","futa_anal","hentai_oral","cum_on_face","cum_on_body",
    "cum_in_pussy","cum_in_ass","cum_in_mouth","breast_play","nipples_play","vaginal_fingering",
    "anal_fingering","masturbation_toy","masturbation_hand","double_penetration_toy",
    "futa_group","yaoi_group","yuri_group","bdsm_hard","bdsm_soft","futa_bondage","yuri_bondage",
    "yaoi_bondage","sex_party","hentai_party","cumshot_party","handjob_party","footjob_party",
    "oral_party","ass_party","pussy_party","tentacle_nsfw"
  ]
};
// Função para pegar imagem aleatória de uma categoria
async function pegarImagemAleatoria(categoria) {
  let imagem = null;
  let tentativas = 0;

  while (!imagem && tentativas < 5) { // tenta até 5 páginas diferentes
    try {
      const page = Math.floor(Math.random() * 1000) + 1;
      const { data } = await axios.get('https://danbooru.donmai.us/posts.json', {
        params: { tags: categoria, page, limit: 1 },
        headers: { 'User-Agent': 'Node.js App' }
      });

      if (data && data.length > 0) {
        imagem = data[0].file_url || data[0].large_file_url || null;
      }

    } catch (err) {
      console.error(`Erro ao buscar categoria ${categoria}: ${err.message}`);
    }
    tentativas++;
  }

  return imagem;
}

// Criando rotas dinamicamente para todas as categorias
Object.keys(categorias).forEach(tipo => {
  categorias[tipo].forEach(cat => {
    router.get(`/${cat}`, async (req, res) => {
      const imagem = await pegarImagemAleatoria(cat);
      if (!imagem) return res.status(404).send('❌ Nenhuma imagem encontrada');

      try {
        const response = await axios.get(imagem, { responseType: 'stream' });
        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
      } catch (err) {
        res.status(500).send(`Erro ao carregar imagem: ${err.message}`);
      }
    });
  });
});

module.exports = router;