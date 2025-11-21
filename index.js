//início de tudo//
const port = 3000;
const express = require('express');
const axios = require('axios');
const cors = require("cors");
const cheerio = require("cheerio");
const fileUpload = require("express-fileupload");
const { identificarMusica } = require("./arquivos/shazam");
const app = express();
const path = require('path');
const { searchRouter, downloadRouter } = require('./arquivos/xvideos');
const loliRouter = require('./arquivos/loli');
const doramasRoutes = require('./arquivos/doramas');
const lyricsRouter2 = require('./arquivos/lyrics')
const animefinder = require("./arquivos/animefinder");
const stalkerTwitter = require('./arquivos/stalktwitter');
const yandereRouter = require('./arquivos/yande.re')
const bratvideo = require("./arquivos/bratvideo");
const { banner, banner2, colors, statusColor } = require('./assets/function');
const consulta = require("./arquivos/consulta");
const gdlink = require("./arquivos/gdlink");
const lyricsRouter = require('./arquivos/lyrics')


const twitter = require("./arquivos/twitter");
const ffStalkRouter = require("./arquivos/ffstalk");
const alldownload = require('./arquivos/alldownload');
// usar a rota
const kwai = require('./arquivos/kwai');
const amazon = require("./arquivos/amazon");
const mediafire = require("./arquivos/mediafire");

// Usar rotas
const ping = require("./arquivos/ping");


const imdbRouter = require("./arquivos/imdb");


const g1 = require("./arquivos/g1");


const youtube2Routes = require('./arquivos/YouTube2');



const youtubeStalk = require("./arquivos/youtube-stalk");

const youtubeRoutes = require('./arquivos/YouTube');
const memesRouter = require("./arquivos/memes");

const tiktokRouter = require('./arquivos/tiktok.js');
const wallpapersearchRouter = require('./arquivos/wallpapersearch');
const wallpapersearch2Router = require('./arquivos/wallpapersearch2');
const pornhub = require("./arquivos/pornhub");
const likevideo = require("./arquivos/likevideo");
const stickerly = require('./arquivos/stickerly');
const figurinhasRouter = require('./arquivos/figurinhas');
const tiktok2Router = require(
  
  './arquivos/tiktok2');
const snackRouter = require("./arquivos/snackvideo");
const frasesanime = require("./arquivos/frasesanime");
const pinterestRouter = require('./arquivos/Pinterest');
const hentaiRouter = require("./arquivos/hentai");
const scpRoute = require("./routes/neext/scp");
const instagramRoute = require("./arquivos/Instagram2");

// Usar a rota

const threadsRouter = require('./arquivos/threads');
const bratRouter = require('./arquivos/brat');
const facebookRouter = require('./arquivos/facebook');
const wallpapergenshinRouter = require('./arquivos/wallpapergenshin');
const safebooruRouter = require('./arquivos/safebooru');
const eshuushuuRouter = require('./arquivos/e-shuushuu');
const photopornoRouter = require('./arquivos/photoporno');
const wallpaperMinecraftRouter = require('./arquivos/wallpaperminecraft');
const noticiasRouter = require("./arquivos/noticias");
const wallpaperAnime = require('./arquivos/wallpaperanime');
const spotifyRouter = require('./arquivos/Spotify');
const freepikRoutes = require('./arquivos/freepik');
const americanas = require("./arquivos/americanas");
const fatos = require("./arquivos/fatos");
app.use("/wame", require("./arquivos/wame"));

IGStoryDownloader = require('./arquivos/igstory');
const instagramRouter = require('./arquivos/Instagram1.js');
const konachanRouter = require('./arquivos/konachan');
const igStalkHandler = require('./arquivos/igstalk');
const attpRoute = require('./arquivos/attp');

// Usando a rota: /attp
const mercadolivre = require("./arquivos/mercadolivre");
app.use("/mercadolivre", mercadolivre);


const xnxx = require("./arquivos/xnxx");
const catboxRouter = require('./upload/catbox');
const sfmcompile = require("./arquivos/sfmcompile");
const lyricssearch = require("./arquivos/lyricssearch");
const kwaistalkerRouter = require('./arquivos/kwaistalker');
const danbooruRouter = require("./arquivos/danbooru")
const espnRouter = require('./arquivos/espn');
const nexoRouter = require('./arquivos/nexojornal');
const redditRouter = require('./arquivos/reddit');
const instagram2 = require("./arquivos/InstagramStalk");
// Usa as rotas do ephoto360 em "/ephoto360"
const pinterestVideoRouter = require('./arquivos/PinterestVideo');
const mp3pm = require("./arquivos/mp3pm");
const tumblrRoutes = require('./arquivos/tumblr');
const animeRouter = require("./arquivos/imdbanime");
const lamacodeRouter = require('./arquivos/lamacode');
const pinterestLens = require("./arquivos/pinterestlens");

const tiktokSearch = require("./arquivos/tiktokSearch");
const stickerwiki = require("./figurinhas/stickerwiki");
const cepRouter = require("./arquivos/cep");
const pessoaRouter = require("./arquivos/geradordepessoa");
const terabox = require("./arquivos/terabox");
const pinterest4 = require("./arquivos/Pinterest4");
app.use("/", pinterest4);
const cpfRouter = require("./arquivos/cpf");
const dddRouter = require("./arquivos/ddd");
const ipRouter = require("./arquivos/ip");
const arma = require("./arquivos/arma");
const accuweather = require("./arquivos/accuweather");
// registra a rota /textpro
const metadinha = require("./arquivos/metadinha");
const savePinRouter = require('./arquivos/savepin');
const cantadasRouter = require("./arquivos/cantadas");
const nsfwhub = require("./arquivos/nsfwhub");
const screenshot = require("./arquivos/screenshotweb");
const bingvideos = require('./arquivos/bingvideos');
const poder360 = require("./arquivos/poder360");
const uol = require("./arquivos/uol");
const exame = require("./arquivos/exame.js");
const bbc = require("./arquivos/bbc.js");

const pensadorsearch = require("./arquivos/pensadorsearch");
const encurtaRouter = require("./arquivos/encurtalink");
const genshin = require("./arquivos/genshinimpact");
const duckerimage = require("./arquivos/duckerimage");
const ephotoRoute = require('./arquivos/ephoto360');
const telefoneRouter = require('./arquivos/telefone');
const conselhoRouter = require("./arquivos/conselho1");
const aGazeta = require("./arquivos/agazeta");
const vejaRouter = require("./arquivos/veja");
const soundCloudRouter = require('./arquivos/SoundCloud');
const youtube2 = require("./arquivos/YouTube2"); //
const photooxyRouter = require("./arquivos/photooxy");
const cnnRoute = require('./arquivos/cnn');
const twitterBiden = require('./canvas/twitterbiden');
const terra = require("./arquivos/terra.js");
const noticiasMinutoRouter = require("./arquivos/noticiaminuto");
const metropolesRouter = require("./arquivos/metropoles"); // caminho para o metropoles.js
const simbolos = require('./arquivos/simbolos');
const folhaRouter = require("./arquivos/folha");
const deezer = require("./arquivos/deezer");
const tradutor = require("./arquivos/tradutor");
const significadonomeRouter = require("./arquivos/significadonome.js");

const bookRouter = require("./arquivos/book.js");
const letraRouter = require("./arquivos/letramusic.js");

const rastreioRouter = require("./arquivos/rastreiacorreio");
const estadaoRouter = require('./arquivos/estadao'); // ajuste o caminho
const themoviedb = require('./arquivos/themoviedb');
const flamingtext = require("./canvas/flamingtext");
const antiporno = require("./arquivos/antiporno");
const logoSupreme = require('./canvas/logosupreme');
const pikachuMeme = require('./canvas/pikachumeme');
const drakeMeme = require('./canvas/drakememe');
const skiplink = require("./arquivos/skiplink");
// usar rota
const conselho2Router = require("./arquivos/conselho2");
const audiomeme = require("./arquivos/audiomeme");
const poohMeme = require('./canvas/poohmeme');
const signo = require("./arquivos/signo"); // <-- rota signo

app.use(cors());
app.use(express.json());
app.use("/api/twitter", twitter);
app.use("/stickerwiki", stickerwiki);
app.use("/sfmcompile", sfmcompile);
app.use('/attp', attpRoute);
app.use("/letramusic", letraRouter);
app.use("/nsfwhub", nsfwhub);
app.use('/canvas/pikachumeme', pikachuMeme);
app.use('/lyrics', lyricsRouter2);
app.use('/canvas/drakememe', drakeMeme);
app.use('/canvas/poohmeme', poohMeme);
app.use("/audiomeme", audiomeme);
app.use("/bluesticker", require("./figurinhas/bluesticker"));
app.use('/download', kwai);      
app.use("/metadinha", metadinha);

app.use("/", pornhub);
app.use("/pesquisa/deezer", deezer);
//Categoria offline
app.use(pinterestLens);
app.use('/canvas/logosupreme', logoSupreme);
app.use('/kwaistalker', kwaistalkerRouter);
app.use('/canvas/twitterbiden', twitterBiden);
app.use('/tmdb', themoviedb);
app.use('/simbolos', simbolos);
app.use("/pesquisa/significadonome", significadonomeRouter);
app.use("/book", bookRouter);
const icmsRouter = require("./arquivos/icms"); 
app.use("/accuweather", accuweather);
app.use("/americanas", americanas);
app.use("/fatos", fatos);
app.use("/arma", arma);
app.use("/jornal/folha", folhaRouter);
app.use("/jornal/metropoles", metropolesRouter);
app.use("/api/duckimage", duckerimage);
app.use("/ddd", dddRouter);
app.use("/amazon", amazon);
app.use("/", tradutor);
app.use("/jornal/noticiaminuto", noticiasMinutoRouter);
app.use("/jornal/exame", exame);
app.use('/search/bing/videos', bingvideos);
app.use("/jornal/veja", vejaRouter);

app.use("/", terabox);
app.use("/", bratvideo);

app.use("/jornal/agazeta", aGazeta);
app.use("/jornal/bbc", bbc);
app.use("/jornal/terra", terra);
app.use("/conselho1", conselhoRouter);
app.use("/pessoa", pessoaRouter);
app.use("/ip", ipRouter);
app.use("/cpf", cpfRouter);
app.use("/conselho2", conselho2Router);
app.use("/encurtar", encurtaRouter);
app.use("/cep", cepRouter);
app.use("/cantadas", cantadasRouter);


app.use("/animefinder", animefinder);
app.use("/signo", signo); // <-- ro
app.use("/photooxy", photooxyRouter);
app.use("/api/tiktok", tiktokSearch);
// Categoria Upload //
app.use("/jornal/uol", uol);
// Importar as rotas
// usa a rota
app.use("/", likevideo);
app.use("/", gdlink);
app.use('/jornal/estadao', estadaoRouter);
app.use('/doramas', doramasRoutes);
// Usar com app.use no mesmo estilo dos outros
app.use("/search/steam", require("./arquivos/steam"));
app.use("/api/tools/skiplink", skiplink);
app.use("/tools/antiporno", antiporno);
app.use("/tools/correio", rastreioRouter);
app.use("/tools/icms", icmsRouter);
app.use('/jornal/cnn', cnnRoute);
app.use('/upload/catbox', catboxRouter);
app.use('/api', tumblrRoutes);
app.use('/ephoto', ephotoRoute);
app.use('/api', redditRouter);
app.use("/", consulta);
app.use("/", flamingtext);
// Categoria notícias //
const textproRouter = require("./arquivos/textpro.js")

app.use("/", textproRouter) // todas as rotas do textpro





app.use("/ping", ping);
app.use('/tools/proxy', require('./arquivos/proxy'));
app.use('/tools/fakepessoa', require('./arquivos/fakepessoa'));
app.use('/pesquisa/wikipedia2', require('./arquivos/wikipedia2'));
app.use('/stalker/twitter', stalkerTwitter);

app.use('/api/ytranscript', require('./arquivos/ytranscript'));
app.use('/download/capcut2', require('./arquivos/capcut2'));
app.use('/stalk/stalkroblox', require('./arquivos/stalkroblox'));
app.use('/api/google', require('./arquivos/google'));
app.use('/pesquisa/googleimage', require('./arquivos/googleimage'));
app.use("/dicionario", require("./arquivos/dicionario"));
app.use('/pesquisa/reels', require('./arquivos/reels'));
app.use('/search/happymod', require('./arquivos/happymod'));
app.use("/jornal/noticias", noticiasRouter);
app.use("/search/aptoide", require("./arquivos/aptoide"));
app.use('/pesquisa/fdroid', require('./arquivos/fdroid'));
app.use('/pesquisa/pinterest2', require('./arquivos/Pinterest2'));
app.use("/apple", require("./arquivos/apple")); // 🔹 nova rota Apple Music Downloader
app.use("/imdb", imdbRouter);
app.use("/anime", animeRouter);
app.use('/jornal/espn', espnRouter);
app.use('/nexojornal', nexoRouter);
// Categoria Wallpaper \\
app.use('/wallpaper/wallpaperminecraft', wallpaperMinecraftRouter);
app.use('/wallpaper/wallpapergenshin', wallpapergenshinRouter);
app.use('/api', alldownload);
app.use("/", ffStalkRouter);
app.use('/api/plaquinha', require('./canvas/plaquinha'));
app.use('/pesquisa/wattpad', require('./arquivos/wattpad'));

app.use("/tools", screenshot);
app.use('/stalk/ttstalk', require('./arquivos/ttstalk'));
app.use("/download/instagram2", instagramRoute);
app.use("/genshin", genshin);
app.use('/stalk/genshinstalk', require('./arquivos/genshinstalk'));
app.use('/search/bingimage', require('./arquivos/bing'));
app.use('/search/bingsearch', require('./arquivos/bingsearch'));
// Categoria Pesquisa //
app.use('/api/dafont', require('./arquivos/dafont'));
const dorama = require("./arquivos/dorama");
app.use("/jornal/g1", g1);
app.use("/jornal/poder360", poder360);
app.use("/api", dorama);
app.use('/jornal/jovempan', require('./arquivos/jovempan'));
app.use('/api/bbb', require('./arquivos/bbb'));
app.use('/search/wallpapersearch', wallpapersearchRouter);
app.use('/search/wallpapersearch2', wallpapersearch2Router);
app.use('/stickerly', stickerly);
app.use('/freepik', freepikRoutes);
app.use('/search/xvideos', searchRouter); 
app.use("/stalk/youtube", youtubeStalk);
app.use('/search/xvideos', searchRouter);
app.use('/chatgpt', require('./arquivos/chatgpt'))
app.use('/', require('./arquivos/qwen'));
app.use('/lamacode', lamacodeRouter);
app.use('/deepseek', require('./arquivos/deepseek'));
app.use('/', require('./arquivos/ai'));
app.use("/mp3pm", mp3pm);
const malRoutes = require('./arquivos/myanimelistsearch');
app.use("/danbooru", danbooruRouter);
app.use('/chatz', require('./arquivos/chatz'));
const anilistRoute = require('./arquivos/anilist');
app.use("/mediafire", mediafire);
app.use("/scp", scpRoute);
app.use('/anilist', anilistRoute);

app.use("/youtube2", youtube2);
app.use(require('./arquivos/telegram'))
app.use("/api/insta-stalk", instagram2);

app.use('/Myanimelist', malRoutes);

const wikiRoutes = require('./arquivos/wiki');
app.use('/search', wikiRoutes); // agora /api/wiki?q=Anime


const playstoreRoutes = require('./arquivos/playstore');
app.use('/playstore', playstoreRoutes);

app.use('/savepin', savePinRouter);


app.use('/search/pinterest', pinterestRouter);
app.use("/search/snack", snackRouter);

app.use("/search/xnxx", xnxx);
app.use("/lyrics", lyricssearch);
// Categoria +18

app.use('/18/photoporno', photopornoRouter);

// Categoria Download

app.use('/download/xvideos', downloadRouter); 


// Usando o router
app.use('/youtube', youtubeRoutes);
app.use('/download/instagram', instagramRouter);
app.use('/download/tiktok', tiktokRouter);
app.use('/download/tiktok2', tiktok2Router);
app.use('/telefone', telefoneRouter);
app.use('/download/spotify', spotifyRouter);
app.use('/facebook', facebookRouter);
app.use('/download/threads', threadsRouter);

app.use('/download/soundcloud', soundCloudRouter);


app.use('/search/pinterestvideo', pinterestVideoRouter);

// frases //
app.use("/frases/frasesanime", frasesanime);
app.use("/frases/pensador", pensadorsearch);

app.use("/frases/frasesanime", frasesanime);
// Categoria Random / Anime

app.use('/random/wallpaperanime', wallpaperAnime);
app.use("/random/memes", memesRouter);
app.use("/random/hentai", hentaiRouter);
app.use('/random/loli', loliRouter);
app.use('/yandere', yandereRouter);
app.use('/random/safebooru', safebooruRouter);
app.use('/random/e-shuushuu', eshuushuuRouter);
app.use('/konachan', konachanRouter);

//shazam desenvolvido pela neext \\

app.post("/shazam", async (req, res) => {
  const caminho = req.body.caminho;

  if (!caminho) {
    return res.json({ erro: "Envie o caminho do arquivo." });
  }

  const resultado = await identificarMusica(caminho);

  if (!resultado) {
    return res.json({ erro: "Falha ao identificar a música." });
  }

  res.json(resultado);
});

// fim //



// Categoria figurinhas \\

app.use('/sticker/brat', bratRouter);
app.use('/sticker/figurinhas', figurinhasRouter);


// Status da API (ping real)
app.get("/status", async (req, res) => {
  const start = Date.now();

  try {
    await axios.get(`http://localhost:${port}/`); // request de teste
    const ping = Date.now() - start;

    res.json({
      status: "online",
      ping, // número
      uptime: Math.floor(process.uptime()) + "s",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.json({
      status: "offline",
      error: err.message
    });
  }
});

// Mostra banners (já exibidos no 

// Middleware para log das rotas usando a função de cores do function.js
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(
            `${colors.MAGENTA}${req.method}${colors.NOCOLOR} ${colors.CYAN}${req.url}${colors.NOCOLOR} - Status: ${statusColor(res.statusCode)}${res.statusCode}${colors.NOCOLOR}`
        );
    });
    next();
});

// Rota raiz
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Rota para docs.html
app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, './public/docs/index.html'));
});

// Servir arquivos estáticos
app.use(express.static(path.resolve(__dirname, 'public')));

// Middleware 404 (sempre por último)
app.use((req, res) => {
    res.status(404).sendFile(path.resolve(__dirname, 'public', '404.html'));
});


app.listen(port, () => {
    console.log(`╭━━━⪩ 「API ON:」 ⪨━━━━﹁`);
    console.log(`│ ⎙ ${colors.CYAN}www.api.neext.online${colors.NOCOLOR}`);
    console.log(`│ ⎙ ${colors.CYAN}http://localhost:${port}${colors.NOCOLOR}`);
    console.log(`╰━━━━━━━─「𖤐」─━━━━━━━━━━」`);
});