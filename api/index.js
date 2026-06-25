import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { GoogleGenAI, Type } from '@google/genai';
import { recommendScene } from '../src/utils/sceneRecommender.js';
import { ensureDirectedVideoPrompt } from '../src/utils/videoPromptDirector.js';
import { createVideoProvider } from '../server/videoProviders/index.js';

const SONGS = JSON.parse(readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/data/catalog.json'), 'utf8'));

const app = express();
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const geminiTimeoutMs = Number(process.env.GEMINI_TIMEOUT_MS || 6000);
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const videoProvider = createVideoProvider();

app.use(express.json({ limit: '1mb' }));

const VIDEO_PROMPT_DIRECTOR_RULES = [
  '你是觅境 App 的 AI 场景导演，专门将用户描述转化为适合生成「5秒无缝循环沉浸式背景视频」的英文 prompt。',
  '任务：将用户输入的中文场景描述，改写为符合所有规则的英文视频生成 prompt。',
  '运动类必须替换，否则循环首尾接不上：移动的车/车流 -> long exposure light trails on wet asphalt；人群/行人 -> empty space with traces of human presence；飞鸟/动物 -> floating light particles, dust motes；下雨 -> rain-soaked reflective surfaces, puddles with ripples；海浪拍打 -> gentle water surface shimmer；烟火 -> slow color bloom, ethereal light pulse；落叶 -> dappled light and leaf shadow play。',
  '文字类必须替换，AI 会生成乱码：霓虹招牌/路牌/广告牌 -> glowing light strips with no readable text；屏幕/大屏 -> display showing color gradients or abstract light waves；店铺招牌 -> warm glowing storefronts, signage dissolved into light。',
  '室内场景可以加入天然适合循环的元素：candle flicker, gently moving curtains, dust motes in light beams, slow rising steam。',
  '氛围色彩对应：赛博/科技 -> purple, cyan, electric blue；治愈/温暖 -> amber, soft gold, honey light；冥想/深空 -> deep indigo, violet, silver starlight；自然/清新 -> soft green, morning mist, pale blue；复古/Lo-fi -> warm orange, faded teal, film grain。',
  'videoPrompt 输出要求：只输出英文 prompt，不加解释，60 到 90 词之间。',
  'videoPrompt 结尾必须一字不差加上：Seamless 5-second loop. Static camera, no pan or zoom. No moving subjects, ambient motion only. NO text, letters, numbers, words, signs, symbols, watermarks or logos of any kind. 4K cinematic quality.',
].join('\n');

function normalizeRecommendation(value, fallback) {
  const validBackgroundIds = new Set(['cyberpunk', 'cabin', 'space', 'beach', 'rainforest', 'snowpeak']);
  const validSongIds = new Set(SONGS.map(song => song.id));
  const validSoundIds = new Set(['rain', 'waves', 'fire', 'crickets', 'space', 'wind', 'vinyl']);

  const activeSounds = Object.fromEntries(
    Object.entries(value.activeSounds || fallback.activeSounds)
      .filter(([soundId]) => validSoundIds.has(soundId))
      .map(([soundId, volume]) => [
        soundId,
        Math.max(0, Math.min(100, Number(volume) || 0)),
      ]),
  );

  return {
    backgroundId: value.backgroundId && validBackgroundIds.has(value.backgroundId) ? value.backgroundId : fallback.backgroundId,
    tag: typeof value.tag === 'string' && value.tag.trim() ? value.tag.trim() : fallback.tag,
    title: typeof value.title === 'string' && value.title.trim() ? value.title.trim().slice(0, 18) : fallback.title,
    prompt: typeof value.prompt === 'string' && value.prompt.trim() ? value.prompt.trim() : fallback.prompt,
    videoPrompt: ensureDirectedVideoPrompt(typeof value.videoPrompt === 'string' && value.videoPrompt.trim() ? value.videoPrompt.trim() : fallback.videoPrompt),
    songId: value.songId && validSongIds.has(value.songId) ? value.songId : fallback.songId,
    activeSounds,
    reason: typeof value.reason === 'string' && value.reason.trim() ? value.reason.trim() : fallback.reason,
  };
}

function includesAny(text, keywords) {
  return keywords.some(keyword => text.includes(keyword));
}

function sanitizeRecommendationForInput(input, recommendation) {
  const text = input.toLowerCase();
  const activeSounds = { ...recommendation.activeSounds };
  const isStreetScene = includesAny(text, ['街头', '街道', '马路', '城市', '店铺', '路边', 'street', 'road', 'city', 'storefront']);
  const isAutumnScene = includesAny(text, ['秋', '深秋', '落叶', 'autumn', 'fall', 'leaf']);
  const isIndoorWarmScene = includesAny(text, ['室内', '木屋', '壁炉', '营火', '火堆', '火炉', 'cabin', 'fireplace', 'campfire']);

  if ((isStreetScene || isAutumnScene) && !isIndoorWarmScene) {
    delete activeSounds.fire;
    if (!activeSounds.wind) activeSounds.wind = 40;
    if (!activeSounds.rain) activeSounds.rain = 18;
    if (!includesAny(text, ['复古', 'lo-fi', 'lofi', '唱片', '胶片', '老电影', 'vinyl', 'film'])) {
      delete activeSounds.vinyl;
    }
  }

  return {
    ...recommendation,
    activeSounds,
  };
}

async function generateGeminiRecommendation(input, fallback) {
  if (!ai) return null;

  const songCatalog = SONGS.map(song => ({
    id: song.id,
    title: song.title,
    artist: song.artist,
    genre: song.genre,
    notes: song.notes,
  }));

  const response = await ai.getGenerativeModel({ model: modelName }).generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          { text: '你是「觅境」的 Scene Studio 推荐器。根据用户输入，为听歌体验生成沉浸式场景配置。' },
          { text: '只允许使用提供的 backgroundId、songId、soundId。输出必须是 JSON。' },
          { text: 'videoPrompt 必须把用户输入的核心场景词放在最前面并放大权重，例如用 "User core scene, highest priority: ..." 开头，不能让模板覆盖用户原始意象。' },
          { text: '如果用户描述秋天、深秋、落叶、街头、街道或清晨街景，不要推荐 fire/篝火；优先使用 wind 和低音量 rain。只有用户明确说复古、Lo-fi、唱片、胶片、老电影时才使用 vinyl。画面用 dappled light and leaf shadow play 替代真实落叶运动。' },
          { text: VIDEO_PROMPT_DIRECTOR_RULES },
          { text: '可用背景: cyberpunk, cabin, space, beach, rainforest, snowpeak' },
          { text: '可用环境音: rain, waves, fire, crickets, space, wind, vinyl' },
          { text: `歌曲目录: ${JSON.stringify(songCatalog)}` },
          { text: `用户输入: ${input}` }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const rawText = response.response.text();
  if (!rawText) return null;
  return sanitizeRecommendationForInput(input, normalizeRecommendation(JSON.parse(rawText), fallback));
}

function withTimeout(promise, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Gemini request timed out after ${timeoutMs}ms`)), timeoutMs);
    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeout));
  });
}

app.post('/api/scene/recommend', async (req, res) => {
  const input = typeof req.body?.input === 'string' ? req.body.input.trim() : '';
  if (!input) {
    res.status(400).json({ error: 'input is required' });
    return;
  }

  const fallback = recommendScene(input, SONGS);
  fallback.videoPrompt = ensureDirectedVideoPrompt(fallback.videoPrompt);
  const sanitizedFallback = sanitizeRecommendationForInput(input, fallback);

  try {
    const recommendation = await withTimeout(generateGeminiRecommendation(input, fallback), geminiTimeoutMs);
    res.json({
      source: recommendation ? 'gemini' : 'local',
      recommendation: recommendation || sanitizedFallback,
    });
  } catch (error) {
    console.error('Gemini scene recommendation failed; using local fallback.', error);
    res.json({
      source: 'local',
      recommendation: sanitizedFallback,
    });
  }
});

app.post('/api/video/generate', async (req, res) => {
  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
  const imageUrl = typeof req.body?.imageUrl === 'string' ? req.body.imageUrl.trim() : undefined;
  const model = typeof req.body?.model === 'string' ? req.body.model.trim() : undefined;
  if (!prompt) {
    res.status(400).json({ error: 'prompt is required' });
    return;
  }

  try {
    const job = await videoProvider.createVideo({ prompt, imageUrl, model });
    res.json(job);
  } catch (error) {
    console.error('Video generation request failed.', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Video generation request failed',
    });
  }
});

app.get('/api/video/:jobId', async (req, res) => {
  try {
    const job = await videoProvider.getVideo(req.params.jobId);
    res.json(job);
  } catch (error) {
    console.error('Video generation status request failed.', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Video generation status request failed',
    });
  }
});

export default app;
