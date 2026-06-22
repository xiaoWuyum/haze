const FINAL_VIDEO_PROMPT_SENTENCE = 'Seamless 5-second loop. Static camera, no pan or zoom. No moving subjects, ambient motion only. NO text, letters, numbers, words, signs, symbols, watermarks or logos of any kind. 4K cinematic quality.';

const STYLE_PALETTES: Record<string, string> = {
  cyberpunk: 'purple, cyan, electric blue',
  cabin: 'amber, soft gold, honey light',
  space: 'deep indigo, violet, silver starlight',
  beach: 'soft green, morning mist, pale blue',
  rainforest: 'soft green, morning mist, pale blue',
  snowpeak: 'deep indigo, violet, silver starlight',
};

function normalizeUserScene(input: string) {
  return input
    .replace(/[，。！？、；：“”"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function translateCoreScene(input: string) {
  const text = input.toLowerCase();
  const parts: string[] = [];

  if (text.includes('深秋') || text.includes('秋') || text.includes('autumn') || text.includes('fall')) {
    parts.push('deep autumn atmosphere');
  }
  if (text.includes('清晨') || text.includes('黎明') || text.includes('morning') || text.includes('dawn')) {
    parts.push('early morning light');
  }
  if (text.includes('街头') || text.includes('街道') || text.includes('马路') || text.includes('street') || text.includes('road')) {
    parts.push('quiet street setting');
  }
  if (text.includes('落叶') || text.includes('叶') || text.includes('leaf')) {
    parts.push('dappled light and leaf shadow play');
  }
  if (text.includes('雨') || text.includes('rain')) {
    parts.push('rain-soaked reflective surfaces, puddles with ripples');
  }
  if (text.includes('海') || text.includes('海浪') || text.includes('ocean') || text.includes('wave')) {
    parts.push('gentle water surface shimmer');
  }
  if (text.includes('霓虹') || text.includes('招牌') || text.includes('广告牌') || text.includes('neon') || text.includes('sign')) {
    parts.push('glowing light strips with no readable text');
  }
  if (text.includes('屏幕') || text.includes('大屏') || text.includes('screen') || text.includes('display')) {
    parts.push('display showing color gradients or abstract light waves');
  }

  return parts.length > 0 ? parts.join(', ') : normalizeUserScene(input);
}

export function ensureDirectedVideoPrompt(prompt: string) {
  const cleaned = prompt
    .replace(/\s+/g, ' ')
    .replace(/NO text.*?4K cinematic quality\./gi, '')
    .replace(/Seamless 5-second loop\..*?4K cinematic quality\./gi, '')
    .trim();

  return `${cleaned} ${FINAL_VIDEO_PROMPT_SENTENCE}`.trim();
}

export function buildDirectedVideoPrompt(input: string, backgroundId: string) {
  const text = input.toLowerCase();
  const palette = STYLE_PALETTES[backgroundId] || 'amber, soft gold, honey light';
  const coreScene = translateCoreScene(input);
  const fragments: string[] = [
    `User core scene, highest priority: ${coreScene}`,
    'Vertical 9:16 immersive mobile background video',
  ];

  if (text.includes('赛博') || text.includes('霓虹') || text.includes('城市') || text.includes('cyber') || text.includes('neon') || text.includes('city')) {
    fragments.push('rain-soaked reflective surfaces, long exposure light trails on wet asphalt, glowing light strips with no readable text');
  } else if (text.includes('秋') || text.includes('落叶') || text.includes('街头') || text.includes('街道') || text.includes('autumn') || text.includes('street')) {
    fragments.push('empty space with traces of human presence, warm glowing storefronts with signage dissolved into light, wet asphalt reflections');
  } else if (text.includes('海') || text.includes('海浪') || text.includes('beach') || text.includes('ocean') || text.includes('wave')) {
    fragments.push('quiet coastal hideaway, gentle water surface shimmer, wet sand reflections, distant horizon softened by mist');
  } else if (text.includes('森林') || text.includes('雨林') || text.includes('自然') || text.includes('forest') || text.includes('nature')) {
    fragments.push('serene forest interior with morning mist, floating light particles and dust motes');
  } else if (text.includes('宇宙') || text.includes('星') || text.includes('space') || text.includes('galaxy')) {
    fragments.push('deep space observation room, silver starlight, abstract light waves on a display, slow ethereal light pulse');
  } else if (text.includes('雪') || text.includes('冬') || text.includes('snow') || text.includes('winter')) {
    fragments.push('quiet snowy mountain shelter, warm glowing windows, slow color bloom, fine atmospheric particles');
  } else {
    fragments.push('cozy interior sanctuary, candle flicker, gently moving curtains, dust motes in light beams, slow rising steam');
  }

  fragments.push(`${palette} color palette, stable composition, first and last frame visually identical`);

  return ensureDirectedVideoPrompt(fragments.join(', '));
}

export { FINAL_VIDEO_PROMPT_SENTENCE };
