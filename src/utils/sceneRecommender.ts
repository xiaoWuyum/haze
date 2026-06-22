import type { Song } from '../types';

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

export const SCENE_TAGS = ['治愈 · 暖', '赛博 · 夜', '冥想 · 深', '治愈 · 海', '幽静 · 静', '白噪 · 眠'];

export const RECOMMENDER_LOGS = [
  '[PROMPT ENGINE] 唤醒 Prompt 增强层...',
  '[VISION COG] 正在把描述转译为电影级循环画面构图...',
  '[ACOUSTIC COG] 分析远景、中景、近景的空间声景层次...',
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

export function recommendScene(input: string, songs: Song[]): SceneRecommendation {
  const text = input.toLowerCase();
  const title = makeTitle(input);

  if (includesAny(text, ['赛博', '合成', '都市', '霓虹', '公寓', '城市', 'cyber', 'cyberpunk', 'city', 'neon', 'apartment'])) {
    return {
      backgroundId: 'cyberpunk',
      tag: '赛博 · 夜',
      title,
      prompt: 'Cyberpunk Tokyo cityscape, ultra-high floor apartment interior, floor-to-ceiling windows, rain streaking down glass, neon reflections, cinematic depth of field, blue-purple color grade, ambient motion only, 8k resolution, seamless looping background.',
      videoPrompt: 'Seamless 8 second loop, fixed camera inside a high-floor cyberpunk Tokyo apartment at night. Heavy rain slides down floor-to-ceiling glass, neon reflections ripple on wet streets below, distant flying vehicles move slowly, cinematic blue and magenta lighting, no text, no people, ambient motion only.',
      songId: pickSong(songs, 'ordinary_friends'),
      activeSounds: { rain: 60, vinyl: 35 },
      reason: '匹配到城市、霓虹或公寓意象，选择雨夜赛博场景，并用雨声与轻微唱片底噪补空间感。',
    };
  }

  if (includesAny(text, ['雨林', '森林', '树', '绿', '自然', 'rain', 'forest', 'tree', 'nature', 'green'])) {
    return {
      backgroundId: 'rainforest',
      tag: '幽静 · 静',
      title,
      prompt: 'Lush magical emerald rain forest at dawn, rain filtering through dense wet canopy, soft mist arising from mossy rocks, extremely healing visual, camera fixed slow visual sway, highly detailed realistic loop.',
      videoPrompt: 'Seamless 8 second loop, fixed camera in an emerald rainforest at dawn. Fine rain falls through dense wet leaves, mist rises from mossy rocks, subtle leaf movement, soft natural light, realistic cinematic atmosphere, no text, no people, ambient motion only.',
      songId: pickSong(songs, 'xiaoban'),
      activeSounds: { rain: 80, wind: 30 },
      reason: '匹配到雨林和自然意象，选择湿润、安静的森林声景。',
    };
  }

  if (includesAny(text, ['银河', '宇宙', '星', '暗', '太空', '科幻', 'space', 'star', 'galaxy', 'cosmic', 'sci-fi', 'scifi'])) {
    return {
      backgroundId: 'space',
      tag: '冥想 · 深',
      title,
      prompt: 'Panoramic majestic view of spiral stellar galaxy from a quiet observation viewport, shimmering stars, cosmic dust gas swirling slowly, high-fidelity dark cosmic space travel mood, seamless drift loop.',
      videoPrompt: 'Seamless 8 second loop, fixed observation window looking into deep space. Stars shimmer gently, cosmic dust and a spiral galaxy drift slowly, dark meditative sci-fi mood, high fidelity cinematic lighting, no text, no people, ambient motion only.',
      songId: pickSong(songs, 'how_sweet'),
      activeSounds: { space: 70, vinyl: 20 },
      reason: '匹配到宇宙、星空或科幻想象，选择深空氛围和轻微颗粒噪声。',
    };
  }

  if (includesAny(text, ['海', '海浪', '沙滩', '椰', '岛', '晴', 'sea', 'ocean', 'wave', 'beach', 'island', 'sunny'])) {
    return {
      backgroundId: 'beach',
      tag: '治愈 · 海',
      title,
      prompt: 'Cozy coastal sun lounger under palm shadows, azure ocean waves washing onto clean white warm sand, gentle tropical sunset sky, slow-motion loop of realistic dynamic marine horizon.',
      videoPrompt: 'Seamless 8 second loop, fixed low camera on a quiet tropical beach. Azure waves wash onto clean white sand, palm shadows sway lightly, sunset light glows on the water, realistic slow motion marine horizon, no text, no people, ambient motion only.',
      songId: pickSong(songs, 'hongdou'),
      activeSounds: { waves: 75, wind: 35 },
      reason: '匹配到海浪和晴天意象，选择海边午后声景。',
    };
  }

  if (includesAny(text, ['雪', '冬', '寒', '冰', '冷', 'snow', 'winter', 'cold', 'ice', 'frozen'])) {
    return {
      backgroundId: 'snowpeak',
      tag: '治愈 · 寒',
      title,
      prompt: 'Spectacular snow-covered pine ridge peaks at dusk, warm flickering canvas tents with gold cozy ambient fire light glowing inside, faint smoke rising, pristine cold air environment, slow realistic loop.',
      videoPrompt: 'Seamless 8 second loop, fixed camera at a snowy mountain camp at dusk. Snow falls softly over pine ridges, warm tent light flickers, faint smoke rises into cold air, calm cinematic winter atmosphere, no text, no people, ambient motion only.',
      songId: pickSong(songs, 'xiaoban'),
      activeSounds: { fire: 65, wind: 55 },
      reason: '匹配到雪、冬天或寒冷意象，选择雪山营火场景。',
    };
  }

  return {
    backgroundId: 'cabin',
    tag: '治愈 · 暖',
    title,
    prompt: 'Quiet mountainside timber lodge interior, glowing brick fireplace logs crackling gently, warm golden volumetric light streaming, steaming herbal tea cup on wood table window sill, heavy rain outside.',
    videoPrompt: 'Seamless 8 second loop, fixed camera in a quiet timber lodge interior. Fireplace logs glow and crackle, warm golden light moves softly across a wooden table, steam rises from a tea cup, rain falls outside the window, no text, no people, ambient motion only.',
    songId: pickSong(songs, 'airport_1030'),
    activeSounds: { fire: 70, crickets: 45, rain: 40 },
    reason: '未命中特定场景关键词，使用温暖木屋作为默认推荐。',
  };
}
