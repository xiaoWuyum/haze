/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Song, Space, AmbientSound } from './types';

export const SONGS: Song[] = [
  {
    id: 'putong',
    title: '普通朋友',
    artist: '陶喆',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=80',
    genre: 'R&B / 节奏蓝调',
    notes: '经典R&B滑音与和弦，柔和的电钢琴敲击搭配温暖低音，最适合雨夜高层公寓的失眠放空。',
    duration: 180,
  },
  {
    id: 'season',
    title: '寂寞的季节',
    artist: '陶喆',
    coverUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&auto=format&fit=crop&q=80',
    genre: 'Acoustic / 极简民谣',
    notes: '空灵木吉他独奏风格，晚秋风拂过枫叶沙沙的声音，是京都木屋黄昏下那一抹斜阳的遗憾。',
    duration: 195,
  },
  {
    id: 'beach',
    title: '沙滩',
    artist: '陶喆',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
    genre: 'Dream Pop / 梦幻流行',
    notes: '缓慢飘逸的和弦铺底，仿佛微风吹拂辽阔海浪。沉稳的低频呼吸起伏，让你瞬间置身温柔海边小屋。',
    duration: 210,
  },
  {
    id: 'melody',
    title: 'Melody',
    artist: '陶喆',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
    genre: 'Ballad / 抒情摇滚',
    notes: '真挚悠扬的乐句，配上沉浸滚动的低音和标志性合唱和弦，是演唱会万人大合唱时的极致震撼。',
    duration: 220,
  },
  {
    id: 'simple',
    title: '爱很简单',
    artist: '陶喆',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80',
    genre: 'Classic / 经典流行',
    notes: '甜美单纯的钢琴音符串联起那些爱人的瞬间。海边小屋午后吹着微风，轻声哼唱最纯粹的爱。',
    duration: 175,
  }
];

export const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'rain', name: '雨声', icon: 'CloudRain', volume: 60, isPlaying: false, synthType: 'rain' },
  { id: 'waves', name: '浪声', icon: 'Waves', volume: 50, isPlaying: false, synthType: 'waves' },
  { id: 'fire', name: '篝火', icon: 'Flame', volume: 50, isPlaying: false, synthType: 'fire' },
  { id: 'crickets', name: '虫鸣', icon: 'Bug', volume: 40, isPlaying: false, synthType: 'crickets' },
  { id: 'space', name: '星空', icon: 'Sparkles', volume: 60, isPlaying: false, synthType: 'space' },
  { id: 'wind', name: '秋风', icon: 'Wind', volume: 40, isPlaying: false, synthType: 'wind' },
  { id: 'vinyl', name: '胶片', icon: 'Disc', volume: 30, isPlaying: false, synthType: 'vinyl' }
];

export const DEFAULT_SPACES: Space[] = [
  {
    id: 'cyberpunk_apartment',
    title: '高层公寓 03:00',
    tag: '赛博 · 夜',
    creator: 'AlleoA07',
    creatorAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=alleo',
    bgImage: '/src/assets/images/cyberpunk_apartment_1782081701973.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-subway-station-with-neon-lights-44133-large.mp4',
    ambientSounds: [
      { soundId: 'rain', volume: 70 },
      { soundId: 'vinyl', volume: 40 }
    ],
    defaultSongId: 'putong',
    description: '城市高空玻璃后的深邃雨夜。窗外霓虹闪烁，房间内温暖安详。适合放空、夜读或失眠夜思。'
  },
  {
    id: 'kyoto_house',
    title: '京都木屋 黄昏',
    tag: '治愈 · 暖',
    creator: 'yuki_',
    creatorAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=yuki',
    bgImage: '/src/assets/images/kyoto_house_1782081720563.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-41864-large.mp4',
    ambientSounds: [
      { soundId: 'crickets', volume: 55 },
      { soundId: 'wind', volume: 40 }
    ],
    defaultSongId: 'season',
    description: '夕阳偏斜洒落在古色木地板上，庭院古树在温润微风中摇曳，蝉鸣、秋虫声渐起。适合舒压与闭目静养。'
  },
  {
    id: 'cosmic_drift',
    title: '宇宙漂移',
    tag: '冥想 · 深',
    creator: 'cosm',
    creatorAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=cosm',
    bgImage: '/src/assets/images/cosmic_drift_1782081735711.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4',
    ambientSounds: [
      { soundId: 'space', volume: 75 }
    ],
    defaultSongId: 'beach',
    description: '一个人漂流在迷金虚空中，静看群星流转、星系幻灭。空灵厚重的太空共鸣，让杂念彻底在宇宙尘埃中解构。'
  },
  {
    id: 'seaside_cottage',
    title: '海边小屋 午后',
    tag: '治愈 · 海',
    creator: 'sea_',
    creatorAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=sea',
    bgImage: '/src/assets/images/seaside_cottage_1782081749529.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-waves-crashing-on-a-beach-46014-large.mp4',
    ambientSounds: [
      { soundId: 'waves', volume: 65 },
      { soundId: 'wind', volume: 30 }
    ],
    defaultSongId: 'simple',
    description: '面朝大海的白色木露台上，浪潮周期性起落轻抚金黄沙滩。清爽海浪与柔和日光，伴你共享悠闲片刻。'
  }
];

export const DEFAULT_MVS: Space[] = [
  {
    id: 'concert_live',
    title: '演唱会现场',
    tag: '演唱会现场',
    creator: '沉浸 · 震撼',
    bgImage: '/src/assets/images/concert_stage_1782081762982.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-crowd-at-a-concert-with-lights-and-smoke-41712-large.mp4',
    ambientSounds: [
      { soundId: 'vinyl', volume: 20 }
    ],
    defaultSongId: 'melody',
    description: '聚光灯交织在漆黑烟雾中，万人呐喊，低音共鸣，完美还原音乐会现场澎湃的心跳震撼。',
    type: 'mv'
  },
  {
    id: 'times_square',
    title: '时代广场',
    tag: '时代广场',
    creator: '城市 · 霓虹',
    bgImage: '/src/assets/images/times_square_1782081776604.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-times-square-street-at-night-40544-large.mp4',
    ambientSounds: [
      { soundId: 'wind', volume: 45 },
      { soundId: 'vinyl', volume: 15 }
    ],
    defaultSongId: 'melody',
    description: '置身纽约斑斓荧屏丛林，流光溢彩，人群涌动，尽享现代都市特有的霓虹律动与自由呼吸感。',
    type: 'mv'
  }
];
