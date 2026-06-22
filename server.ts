import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';
import { SONGS } from './src/data';
import { recommendScene } from './src/utils/sceneRecommender';
import type { SceneRecommendation } from './src/utils/sceneRecommender';
import { createVideoProvider } from './server/videoProviders';

const app = express();
const port = Number(process.env.PORT || 8787);
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const geminiTimeoutMs = Number(process.env.GEMINI_TIMEOUT_MS || 6000);
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const videoProvider = createVideoProvider();

app.use(express.json({ limit: '1mb' }));

function normalizeRecommendation(value: Partial<SceneRecommendation>, fallback: SceneRecommendation): SceneRecommendation {
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
    videoPrompt: typeof value.videoPrompt === 'string' && value.videoPrompt.trim() ? value.videoPrompt.trim() : fallback.videoPrompt,
    songId: value.songId && validSongIds.has(value.songId) ? value.songId : fallback.songId,
    activeSounds,
    reason: typeof value.reason === 'string' && value.reason.trim() ? value.reason.trim() : fallback.reason,
  };
}

async function generateGeminiRecommendation(input: string, fallback: SceneRecommendation): Promise<SceneRecommendation | null> {
  if (!ai) return null;

  const songCatalog = SONGS.map(song => ({
    id: song.id,
    title: song.title,
    artist: song.artist,
    genre: song.genre,
    notes: song.notes,
  }));

  const response = await ai.models.generateContent({
    model,
    contents: [
      '你是「觅境」的 Scene Studio 推荐器。根据用户输入，为听歌体验生成沉浸式场景配置。',
      '只允许使用提供的 backgroundId、songId、soundId。输出必须是 JSON。',
      'prompt 用于静态画面描述；videoPrompt 用于 Runway 文生循环视频，要求固定机位、环境微动、无文字、无人像、适合无缝循环。',
      '可用背景: cyberpunk, cabin, space, beach, rainforest, snowpeak',
      '可用环境音: rain, waves, fire, crickets, space, wind, vinyl',
      `歌曲目录: ${JSON.stringify(songCatalog)}`,
      `用户输入: ${input}`,
    ].join('\n'),
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          backgroundId: { type: Type.STRING },
          tag: { type: Type.STRING },
          title: { type: Type.STRING },
          prompt: { type: Type.STRING },
          videoPrompt: { type: Type.STRING },
          songId: { type: Type.STRING },
          activeSounds: {
            type: Type.OBJECT,
            properties: {
              rain: { type: Type.NUMBER },
              waves: { type: Type.NUMBER },
              fire: { type: Type.NUMBER },
              crickets: { type: Type.NUMBER },
              space: { type: Type.NUMBER },
              wind: { type: Type.NUMBER },
              vinyl: { type: Type.NUMBER },
            },
          },
          reason: { type: Type.STRING },
        },
        required: ['backgroundId', 'tag', 'title', 'prompt', 'videoPrompt', 'songId', 'activeSounds', 'reason'],
      },
    },
  });

  const rawText = response.text;
  if (!rawText) return null;
  return normalizeRecommendation(JSON.parse(rawText), fallback);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
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

  try {
    const recommendation = await withTimeout(generateGeminiRecommendation(input, fallback), geminiTimeoutMs);
    res.json({
      source: recommendation ? 'gemini' : 'local',
      recommendation: recommendation || fallback,
    });
  } catch (error) {
    console.error('Gemini scene recommendation failed; using local fallback.', error);
    res.json({
      source: 'local',
      recommendation: fallback,
    });
  }
});

app.post('/api/video/generate', async (req, res) => {
  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
  const imageUrl = typeof req.body?.imageUrl === 'string' ? req.body.imageUrl.trim() : undefined;
  if (!prompt) {
    res.status(400).json({ error: 'prompt is required' });
    return;
  }

  try {
    const job = await videoProvider.createVideo({ prompt, imageUrl });
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`觅境 API server listening on http://localhost:${port}`);
  console.log(`Video provider: ${videoProvider.name}`);
});
