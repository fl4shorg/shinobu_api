const cfonts = require('cfonts');

// === Força suporte total a cores (TrueColor) ===
process.env.FORCE_COLOR = '3';

// === Banner principal NEEXT API ===
const banner = cfonts.render('SHINOBU API', {
    font: 'block',
    align: 'center',
    colors: ['#ff00ff', '#00bfff'], // degradê exato
    background: 'transparent',
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
    gradient: ['#ff00ff', '#00bfff'],
    transitionGradient: true, // suaviza a transição
    env: 'node'
});

console.log(banner.string ? banner.string : banner);

// === Banner secundário com informações do criador e canal ===
const banner2 = cfonts.render(
    'CRIADOR: FLASH\nCANAL: https://whatsapp.com/channel/0029Vacb5xJKrWQpjjJgwi1z\nV4.0\nINSTAGRAM: @NEET.TK',
    {
        font: 'console',
        align: 'center',
        colors: ['#ff00ff', '#00bfff'],
        gradient: ['#ff00ff', '#00bfff'],
        transitionGradient: true,
        env: 'node'
    }
);

console.log(banner2.string ? banner2.string : banner2);

// === ANSI colors para status HTTP ===
const colors = {
    GREEN: '\x1b[32m',
    CYAN: '\x1b[36m',
    YELLOW: '\x1b[33m',
    RED: '\x1b[31m',
    MAGENTA: '\x1b[35m',
    NOCOLOR: '\x1b[0m'
};

// Função para escolher cor conforme status
function statusColor(statusCode) {
    if (statusCode >= 500) return colors.RED;
    if (statusCode >= 400) return colors.YELLOW;
    if (statusCode >= 300) return colors.CYAN;
    return colors.GREEN;
}

module.exports = { banner, banner2, colors, statusColor };