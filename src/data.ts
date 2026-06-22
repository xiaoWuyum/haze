/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Song, Space, AmbientSound } from './types';

export const SONGS: Song[] = [
  {
    id: 'how_sweet',
    title: 'How Sweet',
    artist: 'NewJeans',
    coverUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&auto=format&fit=crop&q=80',
    genre: 'K-Pop / UK Garage',
    notes: '轻盈、明亮、带一点复古律动的流行舞曲，适合城市夜景和轻快通勤氛围。',
    duration: 219,
    audioUrl: '/audio/How+Sweet+-+NewJeans.mp3',
  },
  {
    id: 'not_like_us',
    title: 'Not Like Us',
    artist: 'Kendrick Lamar',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=80',
    genre: 'Hip-Hop / West Coast',
    notes: '强节奏、强态度的说唱单曲，适合霓虹街区、广场和高能场景。',
    duration: 274,
    audioUrl: '/audio/kendrick+lamar-not+like+us.mp3',
  },
  {
    id: 'billie_jean',
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
    genre: 'Pop / Funk',
    notes: '标志性贝斯线和律动鼓组，适合舞台、夜色公路和复古都会场景。',
    duration: 294,
    audioUrl: '/audio/michael jackson-billie jean.mp3',
  },
  {
    id: 'hongdou',
    title: '红豆',
    artist: '方大同',
    coverUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=300&auto=format&fit=crop&q=80',
    genre: 'Mandopop / R&B',
    notes: '温柔细腻的华语 R&B 质感，适合雨夜、公寓、咖啡和安静独处。',
    duration: 244,
    audioUrl: '/audio/方大同-红豆.mp3',
  },
  {
    id: 'xiaoban',
    title: '小半',
    artist: '陈粒',
    coverUrl: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=300&auto=format&fit=crop&q=80',
    genre: 'Indie Folk / Mandopop',
    notes: '克制、松弛又带着情绪张力的独立流行，适合森林、黄昏和长时间放空。',
    duration: 297,
    audioUrl: '/audio/陈粒-+小半.mp3',
  },
  {
    id: 'airport_1030',
    title: '飞机场的10.30',
    artist: '陶喆',
    coverUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&auto=format&fit=crop&q=80',
    genre: 'Mandopop / R&B',
    notes: '经典华语 R&B 的叙事感和律动感，适合候机厅、城市夜景和雨中车窗。',
    duration: 285,
    audioUrl: '/audio/陶喆+-+飞机场的10.30.mp3',
  },
  {
    id: 'ordinary_friends',
    title: '普通朋友',
    artist: '陶喆',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=80',
    genre: 'Mandopop / R&B',
    notes: '温暖、克制、旋律耐听的华语 R&B，适合深夜公寓和下雨的城市窗口。',
    duration: 254,
    audioUrl: '/audio/陶喆-普通朋友.mp3',
  },
];

export const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'rain', name: '雨声', icon: 'CloudRain', volume: 60, isPlaying: false, synthType: 'rain', audioUrl: '/ambient/雨声.mp3' },
  { id: 'waves', name: '海浪', icon: 'Waves', volume: 50, isPlaying: false, synthType: 'waves', audioUrl: '/ambient/海浪.mp3' },
  { id: 'fire', name: '篝火', icon: 'Flame', volume: 50, isPlaying: false, synthType: 'fire', audioUrl: '/ambient/篝火.mp3' },
  { id: 'crickets', name: '虫鸣', icon: 'Bug', volume: 40, isPlaying: false, synthType: 'crickets', audioUrl: '/ambient/虫鸣.mp3' },
  { id: 'space', name: '夜晚', icon: 'Moon', volume: 60, isPlaying: false, synthType: 'space', audioUrl: '/ambient/夜晚.flac' },
  { id: 'wind', name: '风声', icon: 'Wind', volume: 40, isPlaying: false, synthType: 'wind' },
  { id: 'vinyl', name: '黑胶', icon: 'Disc', volume: 30, isPlaying: false, synthType: 'vinyl' },
];

export const DEFAULT_SPACES: Space[] = [
  {
    id: 'cyberpunk_apartment',
    title: '高层公寓 03:00',
    tag: '赛博 / 夜晚',
    creator: 'AlleoA07',
    creatorAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=alleo',
    bgImage: '/src/assets/images/cyberpunk_apartment_1782081701973.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-subway-station-with-neon-lights-44133-large.mp4',
    ambientSounds: [
      { soundId: 'rain', volume: 70 },
      { soundId: 'vinyl', volume: 40 },
    ],
    defaultSongId: 'ordinary_friends',
    description: '城市高空玻璃后的深夜雨景。窗外霓虹闪烁，房间内温暖安静，适合放空、夜读或失眠时停留。',
  },
  {
    id: 'kyoto_house',
    title: '京都木屋 黄昏',
    tag: '治愈 / 暖色',
    creator: 'yuki_',
    creatorAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=yuki',
    bgImage: '/src/assets/images/kyoto_house_1782081720563.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-41864-large.mp4',
    ambientSounds: [
      { soundId: 'crickets', volume: 55 },
      { soundId: 'wind', volume: 40 },
    ],
    defaultSongId: 'xiaoban',
    description: '夕阳斜落在旧木地板上，庭院树影在微风中摇晃，虫鸣和秋风慢慢浮起。',
  },
  {
    id: 'cosmic_drift',
    title: '宇宙漂移',
    tag: '冥想 / 深空',
    creator: 'cosm',
    creatorAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=cosm',
    bgImage: '/src/assets/images/cosmic_drift_1782081735711.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4',
    ambientSounds: [
      { soundId: 'space', volume: 75 },
    ],
    defaultSongId: 'how_sweet',
    description: '一个人漂流在星云深处，看群星缓慢旋转，让念头在太空回声里散开。',
  },
  {
    id: 'seaside_cottage',
    title: '海边小屋 午后',
    tag: '治愈 / 海边',
    creator: 'sea_',
    creatorAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=sea',
    bgImage: '/src/assets/images/seaside_cottage_1782081749529.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-waves-crashing-on-a-beach-46014-large.mp4',
    ambientSounds: [
      { soundId: 'waves', volume: 65 },
      { soundId: 'wind', volume: 30 },
    ],
    defaultSongId: 'hongdou',
    description: '面朝大海的白色木露台，海浪周期性落下，阳光和风把时间放慢。',
  },
];

export const DEFAULT_MVS: Space[] = [
  {
    id: 'concert_live',
    title: '演唱会现场',
    tag: '舞台 / 聚光',
    creator: 'livehouse',
    bgImage: '/src/assets/images/concert_stage_1782081762982.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-crowd-at-a-concert-with-lights-and-smoke-41712-large.mp4',
    ambientSounds: [
      { soundId: 'vinyl', volume: 20 },
    ],
    defaultSongId: 'billie_jean',
    description: '聚光灯穿过烟雾，人群声和低频共振交织，适合经典流行和复古舞台感。',
    type: 'mv',
  },
  {
    id: 'times_square',
    title: '时代广场',
    tag: '城市 / 霓虹',
    creator: 'city',
    bgImage: '/src/assets/images/times_square_1782081776604.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-times-square-street-at-night-40544-large.mp4',
    ambientSounds: [
      { soundId: 'wind', volume: 45 },
      { soundId: 'vinyl', volume: 15 },
    ],
    defaultSongId: 'not_like_us',
    description: '置身纽约霓虹屏幕之间，人群涌动、车流穿梭，充满现代都市的速度感。',
    type: 'mv',
  },
];
