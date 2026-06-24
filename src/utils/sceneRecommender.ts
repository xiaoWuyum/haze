import type { Song } from '../types';
import { buildDirectedVideoPrompt } from './videoPromptDirector';

export interface SceneRecommendation {
  backgroundId: string;
  tag: string;
  title: string;
  prompt: string;
  videoPrompt: string;
  songId: string;
  activeSounds: Record<string, number>;
  reason: string;
}

export const SCENE_TAGS = ['治愈', '赛博', '冥想', '幽静', '白噪'];

export const RECOMMENDER_LOGS = [
  '[PROMPT ENGINE] 唤醒 Prompt 增强层...',
  '[VISION COG] 正在把描述转译为电影级循环画面构图...',
  '[SPATIAL DESCRIPTOR] 场景配置与参数标定完成，正在同步至 Scene Studio!',
];

function pickSong(songs: Song[], id: string) {
  return songs.find(song => song.id === id)?.id || songs[0]?.id || '';
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some(keyword => text.includes(keyword));
}

function makeTitle(input: string) {
  return input.trim().slice(0, 10) || '未命名空间';
}

function createRecommendation(input: string, songs: Song[], data: Omit<SceneRecommendation, 'title' | 'videoPrompt'>): SceneRecommendation {
  return sanitizeSceneRecommendation(input, {
    ...data,
    title: makeTitle(input),
    videoPrompt: buildDirectedVideoPrompt(input, data.backgroundId),
  });
}

function sanitizeSceneRecommendation(input: string, recommendation: SceneRecommendation): SceneRecommendation {
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

export function recommendScene(input: string, songs: Song[]): SceneRecommendation {
  const text = input.toLowerCase();

  if (includesAny(text, ['赛博', '合成', '都市', '霓虹', '公寓', '城市', 'cyber', 'cyberpunk', 'city', 'neon', 'apartment'])) {
    return createRecommendation(input, songs, {
      backgroundId: 'cyberpunk',
      tag: '赛博',
      prompt: 'Cyberpunk Tokyo cityscape, ultra-high floor apartment interior, floor-to-ceiling windows, rain-soaked reflective surfaces, glowing light strips, cinematic depth of field.',
      songId: pickSong(songs, 'ordinary_friends'),
      activeSounds: { rain: 60, vinyl: 35 },
      reason: '匹配到城市、霓虹或公寓意象，选择雨夜赛博声景。',
    });
  }

  if (includesAny(text, ['雨林', '森林', '树', '绿', '自然', 'rain', 'forest', 'tree', 'nature', 'green'])) {
    return createRecommendation(input, songs, {
      backgroundId: 'rainforest',
      tag: '幽静',
      prompt: 'Lush emerald rain forest at dawn, soft mist, dappled light and leaf shadow play, floating dust motes, quiet cinematic atmosphere.',
      songId: pickSong(songs, 'xiaoban'),
      activeSounds: { rain: 80, wind: 30 },
      reason: '匹配到雨林和自然意象，选择湿润、安静的森林声景。',
    });
  }

  if (includesAny(text, ['银河', '宇宙', '星', '暗', '太空', '科幻', 'space', 'star', 'galaxy', 'cosmic', 'sci-fi', 'scifi'])) {
    return createRecommendation(input, songs, {
      backgroundId: 'space',
      tag: '冥想',
      prompt: 'Deep space observation room, silver starlight, abstract light waves, violet cosmic haze, meditative sci-fi mood.',
      songId: pickSong(songs, 'how_sweet'),
      activeSounds: { space: 70, vinyl: 20 },
      reason: '匹配到宇宙、星空或科幻想象，选择深空氛围。',
    });
  }

  if (includesAny(text, ['海', '海浪', '沙滩', '椰', '岛', '晴', 'sea', 'ocean', 'wave', 'beach', 'island', 'sunny'])) {
    return createRecommendation(input, songs, {
      backgroundId: 'beach',
      tag: '治愈',
      prompt: 'Quiet tropical beach, gentle water surface shimmer, wet sand reflections, pale blue horizon, calm cinematic coastal mood.',
      songId: pickSong(songs, 'hongdou'),
      activeSounds: { waves: 75, wind: 35 },
      reason: '匹配到海浪和晴天意象，选择海边午后声景。',
    });
  }

  if (includesAny(text, ['雪', '冬', '寒', '冰', '冷', 'snow', 'winter', 'cold', 'ice', 'frozen'])) {
    return createRecommendation(input, songs, {
      backgroundId: 'snowpeak',
      tag: '治愈',
      prompt: 'Snowy mountain shelter at dusk, warm glowing windows, fine atmospheric particles, soft color bloom, quiet winter mood.',
      songId: pickSong(songs, 'xiaoban'),
      activeSounds: { fire: 65, wind: 55 },
      reason: '匹配到雪、冬天或寒冷意象，选择雪山营火场景。',
    });
  }

  return createRecommendation(input, songs, {
    backgroundId: 'cabin',
    tag: '治愈',
    prompt: 'Cozy interior sanctuary, candle flicker, gently moving curtains, dust motes in light beams, slow rising steam, warm cinematic mood.',
    songId: pickSong(songs, 'airport_1030'),
    activeSounds: { fire: 70, crickets: 45, rain: 40 },
    reason: '未命中特定场景关键词，使用温暖室内空间作为默认推荐。',
  });
}
