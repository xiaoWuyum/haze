/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Space, Song, AmbientSound } from '../types';
import { LucideIcon } from './LucideIcon';
import { motion, AnimatePresence } from 'motion/react';

interface CreateScreenProps {
  songs: Song[];
  ambientSounds: AmbientSound[];
  onCreateSpace: (space: Space, bgImageChoice: string) => void;
}

const PRESET_WALLPAPERS = [
  {
    id: 'cyberpunk',
    name: '赛博大厦',
    prompt: 'A futuristic cyber apartment',
    url: 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?w=420&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-subway-station-with-neon-lights-44133-large.mp4',
    tag: '赛博 · 夜'
  },
  {
    id: 'cabin',
    name: '林中壁炉',
    prompt: 'A cozy forest cabin with crackling fireplace',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=420&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fireplace-burning-with-bright-fire-in-dark-cozy-room-41604-large.mp4',
    tag: '治愈 · 暖'
  },
  {
    id: 'space',
    name: '幽深太空',
    prompt: 'Surreal cosmic stars',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=420&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4',
    tag: '冥想 · 深'
  },
  {
    id: 'beach',
    name: '梦幻海滩',
    prompt: 'Bright tropical ocean beach shore',
    url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=420&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-waves-crashing-on-a-beach-46014-large.mp4',
    tag: '治愈 · 海'
  },
  {
    id: 'rainforest',
    name: '雨中秘境',
    prompt: 'Lush magical green rain forest at dawn',
    url: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=420&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-41864-large.mp4',
    tag: '幽静 · 静'
  },
  {
    id: 'snowpeak',
    name: '雪山营火',
    prompt: 'Majestic snowy mountain ridge tents campfire',
    url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=420&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-snow-falling-decorating-coniferous-trees-in-a-forest-44111-large.mp4',
    tag: '治愈 · 寒'
  }
];

export const CreateScreen: React.FC<CreateScreenProps> = ({
  songs,
  ambientSounds,
  onCreateSpace,
}) => {
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [genLogs, setGenLogs] = useState<string[]>([]);
  
  const [title, setTitle] = useState('');
  const [selectedTag, setSelectedTag] = useState('治愈 · 暖');
  const [selectedSongId, setSelectedSongId] = useState(songs[0].id);
  const [selectedBgId, setSelectedBgId] = useState(PRESET_WALLPAPERS[0].id);
  const [createdList, setCreatedList] = useState<AmbientSound[]>(
    ambientSounds.map(s => ({ ...s, volume: 40, isPlaying: s.id === 'rain' }))
  );
  const [success, setSuccess] = useState(false);

  const TAGS = ['治愈 · 暖', '赛博 · 夜', '冥想 · 深', '治愈 · 海', '幽静 · 静', '白噪 · 眠'];

  // AI Prompt expansion engine simulation matching user's exact three-tier logic
  const handleAIEnhance = () => {
    if (!userInput.trim()) return;
    setIsGenerating(true);
    setGenLogs([]);
    
    const logs = [
      '⚡ [PROMPT ENGINE] 唤醒 Prompt 增强层...',
      '🎨 [VISION COG] 正在转译词法为电影级 3D 循环画幅 (Seamless Loop) 构图...',
      '🎵 [ACOUSTIC COG] 分析空间音频构成: 映射远景 (城市/车流/太空深空) 中景 (风雨声) 及近景 (壁炉/空调/白噪音)',
      '✨ [SPATIAL DESCRIPTOR] 场景配器与参数标定完成，正应用至 Scene Studio!'
    ];

    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < logs.length) {
        setGenLogs(prev => [...prev, logs[logIndex]]);
        logIndex++;
      } else {
        clearInterval(interval);
        
        // Analyze keyword mapping
        const text = userInput.toLowerCase();
        let bgId = 'cabin';
        let tag = '治愈 · 暖';
        let matchedPrompt = '';
        let matchedTitle = userInput.trim().slice(0, 10);
        let defaultSong = songs[0].id; // default
        let activeSounds: { [key: string]: number } = {};

        if (text.includes('赛博') || text.includes('合成') || text.includes('都市') || text.includes('霓虹') || text.includes('公寓') || text.includes('城市')) {
          bgId = 'cyberpunk';
          tag = '赛博 · 夜';
          matchedPrompt = 'Cyberpunk Tokyo cityscape, ultra-high floor apartment interior, floor-to-ceiling windows, rain streaking down glass, neon reflections, cinematic depth of field, blue-purple color grade, ambient motion only, 8k resolution, seamless looping background.';
          defaultSong = songs.find(s => s.id === 'ordinary_friends')?.id || songs[0].id;
          activeSounds = { rain: 60, static: 45 };
        } else if (text.includes('雨') || text.includes('林') || text.includes('树') || text.includes('绿') || text.includes('森林') || text.includes('自然')) {
          bgId = 'rainforest';
          tag = '幽静 · 静';
          matchedPrompt = 'Lush magical emerald rain forest at dawn, rain filtering through dense wet canopy, soft mist arising from mossy rocks, extremely healing visual, camera fixed slow visual sway, highly detailed realistic loop.';
          defaultSong = songs.find(s => s.id === 'xiaoban')?.id || songs[0].id;
          activeSounds = { rain: 80, wind: 30 };
        } else if (text.includes('银河') || text.includes('宇') || text.includes('星') || text.includes('暗') || text.includes('太空') || text.includes('科幻')) {
          bgId = 'space';
          tag = '冥想 · 深';
          matchedPrompt = 'Panoramic majestic view of spiral stellar galaxy from a quiet observation viewport, shimmering stars, cosmic dust gas swirling slowly, high-fidelity dark cosmic space travel mood, seamless drift loop.';
          defaultSong = songs.find(s => s.id === 'how_sweet')?.id || songs[0].id;
          activeSounds = { space: 70, static: 25 };
        } else if (text.includes('海') || text.includes('浪') || text.includes('沙滩') || text.includes('椰') || text.includes('岛') || text.includes('晴')) {
          bgId = 'beach';
          tag = '治愈 · 海';
          matchedPrompt = 'Cozy coastal sun lounger under palm shadows, azure ocean waves washing onto clean white warm sand, gentle tropical sunset sky, slow-motion loop of realistic dynamic marine horizon.';
          defaultSong = songs.find(s => s.id === 'hongdou')?.id || songs[0].id;
          activeSounds = { waves: 75, wind: 35 };
        } else if (text.includes('雪') || text.includes('冬') || text.includes('寒') || text.includes('冰') || text.includes('冷')) {
          bgId = 'snowpeak';
          tag = '治愈 · 寒';
          matchedPrompt = 'Spectacular snow-covered pine ridge peaks at dusk, warm flickering canvas tents with gold cozy ambient fire light glowing inside, faint smoke rising, pristine cold air environment, slow realistic loop.';
          defaultSong = songs.find(s => s.id === 'xiaoban')?.id || songs[0].id;
          activeSounds = { fire: 65, wind: 55 };
        } else {
          // Default: Cabin
          bgId = 'cabin';
          tag = '治愈 · 暖';
          matchedPrompt = 'Quiet mountainside timber lodge interior, glowing brick fireplace logs crackling gently, warm golden volumetric light streaming, steaming herbal tea cup on wood table window sill, heavy rain outside.';
          defaultSong = songs.find(s => s.id === 'airport_1030')?.id || songs[0].id;
          activeSounds = { fire: 70, crickets: 45, rain: 40 };
        }

        // Apply state updates simulating immediate smart layout creation
        setSelectedBgId(bgId);
        setSelectedTag(tag);
        setSelectedSongId(defaultSong);
        setTitle(matchedTitle);
        setEnhancedPrompt(matchedPrompt);
        
        // Setup initial sound mixes
        setCreatedList(prev => 
          prev.map(sound => ({
            ...sound,
            isPlaying: activeSounds[sound.id] !== undefined,
            volume: activeSounds[sound.id] !== undefined ? activeSounds[sound.id] : 30
          }))
        );

        setIsGenerating(false);
      }
    }, 450);
  };

  const handleToggleSound = (id: string) => {
    setCreatedList(prev => 
      prev.map(s => s.id === id ? { ...s, isPlaying: !s.isPlaying } : s)
    );
  };

  const handleSetVolume = (id: string, vol: number) => {
    setCreatedList(prev => 
      prev.map(s => s.id === id ? { ...s, volume: vol } : s)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const bgChoice = PRESET_WALLPAPERS.find(p => p.id === selectedBgId) || PRESET_WALLPAPERS[0];

    const activeAtmosphereMix = createdList
      .filter(s => s.isPlaying)
      .map(s => ({ soundId: s.id, volume: s.volume }));

    const newSpace: Space = {
      id: `custom_${Date.now()}`,
      title: title.trim(),
      tag: selectedTag,
      creator: 'Sx (我)',
      creatorAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=creator',
      bgImage: bgChoice.url,
      videoUrl: bgChoice.videoUrl,
      ambientSounds: activeAtmosphereMix.length > 0 ? activeAtmosphereMix : [{ soundId: 'rain', volume: 50 }],
      defaultSongId: selectedSongId,
      description: enhancedPrompt 
        ? `使用 AI 增强型创作指令：${enhancedPrompt}`
        : `这是由你量身定制的浪漫放松氛围“${title}”，搭配优雅的键盘配器音乐和大自然音，尽享内心的静谧安逸。`,
      type: 'space'
    };

    onCreateSpace(newSpace, bgChoice.url);
    setSuccess(true);
    
    // Auto reset form
    setTitle('');
    setUserInput('');
    setEnhancedPrompt('');
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <div className="w-full px-6 pt-8 pb-32 max-w-md mx-auto relative">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-wide font-sans">创建空间</h1>
        <p className="text-xs text-zinc-400 mt-1.5">调配你的奇幻氛围，定义每首歌的专属时空</p>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mb-5 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 shadow-xl backdrop-blur-md"
          >
            <LucideIcon name="Check" className="text-emerald-400 shrink-0" size={18} />
            <div>
              <span className="font-bold block text-sm">空间创制成功!</span>
              请在“广场（精选空间）”或者您的收藏列表里查看并畅听。
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEW: Interactive AI Prompt Enhancement Terminal Section */}
      <div className="mb-6 p-5 rounded-2xl bg-zinc-900/40 border border-cyan-500/10 backdrop-blur-md flex flex-col gap-3.5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">AI 意境生图与声景定位 (Scene Studio)</h3>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 border border-cyan-500/20 text-cyan-300 bg-cyan-950/40 rounded font-mono">MVP v1.0</span>
        </div>

        <p className="text-[10px] text-zinc-400 leading-relaxed">
          输入一个简单的词汇或梦境描述，由系统 Prompt 增强层为您**扩写专业描述**、**检索匹配背景**并**自动组合 3 层环境音轨**。
        </p>

        <div className="flex flex-col gap-2">
          <textarea
            placeholder="例如: 赛博朋克下的东京雨夜... 或者 温暖壁炉与小木屋..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isGenerating}
            rows={2}
            className="w-full px-3 py-2.5 bg-black/50 border border-white/5 disabled:opacity-50 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/30 transition-all font-sans leading-relaxed text-left resize-none"
          />
          <button
            type="button"
            onClick={handleAIEnhance}
            disabled={isGenerating || !userInput.trim()}
            className="w-full py-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/50 disabled:opacity-40 disabled:hover:bg-cyan-950/80 text-[10px] font-bold tracking-wider hover:text-white flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
          >
            <LucideIcon name="Sparkles" size={11} className={isGenerating ? "animate-spin" : ""} />
            <span>{isGenerating ? "正在通过 AI 增强管道解析中..." : "✨ 智能增强，适配画幅与大自然音"}</span>
          </button>
        </div>

        {/* Dynamic Logging Feed */}
        {genLogs.length > 0 && (
          <div className="p-3 rounded-lg bg-black/60 border border-white/5 font-mono text-[9px] text-cyan-500/90 leading-relaxed text-left max-h-32 overflow-y-auto flex flex-col gap-1 shadow-inner">
            {genLogs.map((log, index) => (
              <div key={index} className="flex gap-1.5 items-start">
                <span className="text-zinc-600 font-bold">›</span>
                <span>{log}</span>
              </div>
            ))}
            {isGenerating && (
              <div className="flex gap-1.5 items-center mt-1 text-[8px] text-zinc-500">
                <div className="w-2.5 h-2.5 rounded-full border border-cyan-400 border-t-transparent animate-spin shrink-0" />
                <span>实时声波滤波器调理中...</span>
              </div>
            )}
          </div>
        )}

        {/* Display response of enhanced description */}
        {enhancedPrompt && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-300 flex flex-col gap-1.5 text-left"
          >
            <div className="flex items-center gap-1.5 leading-none">
              <LucideIcon name="PartyPopper" size={11} className="text-cyan-400" />
              <span className="font-bold text-[10px] uppercase tracking-wider">Prompt 增强与音景配置已同步!</span>
            </div>
            <p className="text-[10px] text-cyan-400/80 leading-relaxed italic bg-black/20 p-2 rounded-lg font-mono">
              "{enhancedPrompt}"
            </p>
            <div className="text-[9px] text-zinc-500 flex items-center gap-1 mt-0.5">
              <LucideIcon name="CornerRightDown" size={9} />
              <span>已一键同步下方：场景名称、默认主题曲、大气音音控轨道</span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3.5 pl-1">
        <LucideIcon name="SlidersHorizontal" size={12} className="text-zinc-500" />
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">场景参数详情与人工微调</h4>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-zinc-900/40 p-5 rounded-2xl border border-white/5 backdrop-blur-md">
        
        {/* 1. Name Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">空间名称</label>
          <input 
            type="text" 
            placeholder="例如: 林间细雨、落叶午后、失落极星..." 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={18}
            className="w-full px-3.5 py-2.5 bg-black/40 border border-white/5 rounded-xl text-xs text-white placeholder-zinc-500 hover:border-white/10 focus:border-cyan-500/40 focus:outline-none transition-all"
          />
        </div>

        {/* 2. Preset Tags selection info */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">空间标签 / 调性</label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map(tag => (
              <button
                type="button"
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                  selectedTag === tag 
                    ? 'bg-cyan-950/60 border-cyan-500/30 text-cyan-400 shadow-md' 
                    : 'bg-black/20 border-zinc-805 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Base Background Wallpaper Preset Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">背景映像 preset</label>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_WALLPAPERS.map(preset => (
              <div 
                key={preset.id}
                onClick={() => {
                  setSelectedBgId(preset.id);
                  // auto set tag for matching theme
                  setSelectedTag(preset.tag);
                }}
                className={`relative h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                  selectedBgId === preset.id 
                    ? 'border-cyan-400 scale-95 shadow-lg shadow-cyan-500/10' 
                    : 'border-zinc-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img 
                  src={preset.url} 
                  alt={preset.name} 
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40" />
                <span className="absolute bottom-1.5 left-1.5 right-1.5 text-[9px] text-white font-bold tracking-wider truncate text-center bg-black/50 py-0.5 rounded-md leading-none">
                  {preset.name}
                </span>
                {selectedBgId === preset.id && (
                  <div className="absolute top-1 right-1 w-3 h-3 bg-cyan-400 rounded-full flex items-center justify-center">
                    <LucideIcon name="Check" className="text-black" size={8} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4. Select default theme song */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">默认主题音乐 (陶喆 经典合辑)</label>
          <select 
            value={selectedSongId}
            onChange={(e) => setSelectedSongId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-black/40 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/40 cursor-pointer transition-all"
          >
            {songs.map(song => (
              <option key={song.id} value={song.id} className="bg-zinc-950 text-white text-xs">
                {song.title} - {song.artist} ({song.genre})
              </option>
            ))}
          </select>
        </div>

        {/* 5. Custom default atmosphere mixes */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">调配背景大气合成声</label>
          <p className="text-[10px] text-zinc-500 leading-relaxed">选择开启哪些自然白噪声，并预设它们默认初始音量大小。</p>

          <div className="flex flex-col gap-2.5 mt-1 max-h-44 overflow-y-auto pr-1">
            {createdList.map(item => {
              const active = item.isPlaying;
              return (
                <div 
                  key={item.id}
                  className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${
                    active 
                      ? 'bg-zinc-950/60 border-white/10' 
                      : 'bg-transparent border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleSound(item.id)}
                    className={`w-7 h-7 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                      active 
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    <LucideIcon name={item.icon} size={13} />
                  </button>

                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-white">{item.name}</span>
                      <span className="text-zinc-500 font-mono">{item.volume}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={item.volume}
                      disabled={!active}
                      onChange={(e) => handleSetVolume(item.id, parseInt(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer disabled:opacity-20 accent-cyan-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Create action button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          id="btn_create_submit"
          className="w-full py-3 mt-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-tr from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-black shadow-lg shadow-cyan-500/10 cursor-pointer transition-colors"
        >
          发布我的场景时空
        </motion.button>

      </form>
    </div>
  );
};

