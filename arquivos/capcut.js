const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const aws4 = require('aws4');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

const TEMP_DIR = path.join(process.cwd(), 'temp_capcut');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const MAX_VIDEO_DURATION_SECONDS = 600;
const MAX_VIDEO_WIDTH = 4096;
const MAX_VIDEO_HEIGHT = 2160;
const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024;

class CapcutMagic {
    constructor(isDebug = false) {
        this.isDebug = isDebug;
        this.config = {
            PF: '7',
            APP_VERSION: '5.8.0',
            SIGN_VERSION: '1',
            USER_AGENT: 'Mozilla/5.0',
            X_TT_ENV: 'boe',
            APP_SDK_VERSION: '48.0.0',
            AUTHORITY: 'edit-api-sg.capcut.com',
            ORIGIN: 'https://www.capcut.com',
            REFERER: 'https://www.capcut.com/',
            API_BASE_URL: 'https://edit-api-sg.capcut.com',
            VOD_HOST: 'vod-ap-singapore-1.bytevcloudapi.com',
            VOD_REGION: 'sg',
            VOD_API_VERSION: '2020-11-19',
            VOD_SERVICE_NAME: 'vod',
            DEFAULT_CHUNK_SIZE,
            SIGN_SALT_1: '9e2c',
            SIGN_SALT_2: '11ac',
        };
    }

    log = (msg) => this.isDebug && console.log(msg);
    debug = (label, data) => this.isDebug && console.log(`DEBUG ${label}:`, data);

    _request = async (method, url, config = {}) => {
        return axios({ method, url, ...config }).then(res => res.data);
    }

    _generateSign = ({ url, pf, appvr, tdid }) => {
        const ts = Math.floor(Date.now() / 1000);
        const sliceLastChars = (input, length = 7) => input.slice(-length);
        const hashMD5 = (input) => crypto.createHash('md5').update(input).digest('hex');
        const sign = hashMD5(
            [this.config.SIGN_SALT_1, sliceLastChars(url), pf, appvr, ts, tdid, this.config.SIGN_SALT_2].join('|')
        ).toLowerCase();
        return { sign, 'device-time': ts };
    }

    _generateHeaders = (url, payload, cookie = '') => {
        const { sign, 'device-time': deviceTime } = this._generateSign({ url, pf: this.config.PF, appvr: this.config.APP_VERSION, tdid: '' });
        return {
            'authority': this.config.AUTHORITY,
            'app-sdk-version': this.config.APP_SDK_VERSION,
            'appvr': this.config.APP_VERSION,
            'content-type': 'application/json',
            'cookie': cookie,
            'device-time': deviceTime,
            'origin': this.config.ORIGIN,
            'pf': this.config.PF,
            'referer': this.config.REFERER,
            'sign': sign,
            'sign-ver': this.config.SIGN_VERSION,
            'user-agent': this.config.USER_AGENT,
            'x-tt-env': this.config.X_TT_ENV
        };
    }

    getCookie = async () => {
        const url = `${this.config.ORIGIN}/magic-tools/upscale-image`;
        const res = await axios.get(url, { headers: { 'User-Agent': this.config.USER_AGENT } });
        return res.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';
    }

    _generateSHA256Hash = (payload) => crypto.createHash('sha256').update(payload).digest('hex');

    _getMetaVideo = async (videoBuffer, tempFileName) => {
        const tempVideoPath = path.join(TEMP_DIR, tempFileName);
        await fsPromises.writeFile(tempVideoPath, videoBuffer);
        return new Promise((resolve, reject) => {
            const ffmpeg = spawn(ffmpegPath, ['-i', tempVideoPath, '-f', 'null', '-']);
            let stderr = '';
            ffmpeg.stderr.on('data', data => stderr += data.toString());
            ffmpeg.on('close', code => {
                if (code !== 0) return reject(new Error('FFmpeg failed'));
                const durationMatch = stderr.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.(\d+)/);
                if (!durationMatch) return reject(new Error('Cannot parse duration'));
                const duration = parseInt(durationMatch[1]) * 3600 + parseInt(durationMatch[2]) * 60 + parseInt(durationMatch[3]) + parseInt(durationMatch[4]) / 1000;
                if (duration > MAX_VIDEO_DURATION_SECONDS) return reject(new Error('Video too long'));
                const resMatch = stderr.match(/Stream #\d+:\d+.*Video:.*\s(\d{2,5})x(\d{2,5})[\s,]/);
                if (!resMatch) return reject(new Error('Cannot parse resolution'));
                const width = parseInt(resMatch[1]), height = parseInt(resMatch[2]);
                if (width > MAX_VIDEO_WIDTH || height > MAX_VIDEO_HEIGHT) return reject(new Error('Resolution too large'));
                fsPromises.unlink(tempVideoPath).catch(() => {});
                resolve({ width, height, duration });
            });
        });
    }

    async createCapcutVideo(videoBuffer) {
        const cookie = await this.getCookie();
        const tempFileName = `video_${Date.now()}.mp4`;
        const meta = await this._getMetaVideo(videoBuffer, tempFileName);

        // Aqui você colocaria a lógica de upload completo com AWS VOD e commit
        // Para simplificação retornamos apenas info de vídeo
        return {
            message: 'Vídeo recebido e validado',
            meta,
            tempFileName
        };
    }
}

// ================== EXPRESS ROUTER ==================
const router = express.Router();
router.use(express.json({ limit: '200mb' })); // suporta vídeos grandes em base64

router.post('/', async (req, res) => {
    try {
        const { videoBase64 } = req.body;
        if (!videoBase64) return res.status(400).json({ error: 'videoBase64 is required' });

        const videoBuffer = Buffer.from(videoBase64, 'base64');
        const capcut = new CapcutMagic(false);
        const result = await capcut.createCapcutVideo(videoBuffer);

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong', details: err.message });
    }
});

// ================== EXPORT PARA APP USE ==================
module.exports = router;