/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AmbientSound, Song, Space } from '../types';
import { LucideIcon } from './LucideIcon';
import { type VideoGenerationJob } from '../utils/videoGenerationClient';
import meAvatarUrl from '../picture/me.jpeg';

interface CreateScreenProps {
  songs: Song[];
  ambientSounds: AmbientSound[];
  videoJob: VideoGenerationJob | null;
  generatedVideoUrl: string;
  videoError: string;
  isGeneratingVideo: boolean;
  onGenerateVideo: (prompt: string) => Promise<void>;
  onClearVideoGeneration: () => void;
  onCreateSpace: (space: Space) => void;
  onOpenProfile: () => void;
}

type Stage = 'signal' | 'broadcast' | 'loading' | 'reveal';

interface WorldBlueprint {
  name: string;
  subtitle: string;
  climate: string;
  gravity: string;
  civilization: string;
  firstScene: string;
  palette: string[];
  tag: string;
}

const SIGNAL_EXAMPLES = [
  '疾驰的高速公路',
  '月下安静的麦田',
  '雨中的寺庙',
];

const WORLD_TAGS = ['治愈', '赛博', '冥想', '幽静', '白噪'];

const BROADCAST_STEPS = [
  'receiving spatial intent',
  'mapping emotional terrain',
  'extracting skyline silhouettes',
  'constructing atmosphere layer',
  'tuning light, gravity, weather',
  'placing traces of civilization',
  'opening first visitor corridor',
  'world seed stabilized',
];

const LOADING_STEPS = [
  { label: 'Atmosphere', value: 92 },
  { label: 'Terrain', value: 78 },
  { label: 'Civilization', value: 64 },
  { label: 'Light System', value: 88 },
  { label: 'Unknown Events', value: 47 },
];

const WORLD_IMAGES = [
  'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&auto=format&fit=crop&q=80',
];

const makeBlueprint = (signal: string): WorldBlueprint => {
  const clean = signal.trim() || '未命名的新空间';
  const seed = clean.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const names = ['ORBIS', 'LUMEN', 'NOCTIL', 'AURA', 'VELA', 'MIRAGE'];
  const places = ['Archive', 'Harbor', 'Garden', 'Citadel', 'Station', 'Delta'];
  const climates = ['电蓝色风暴与低温金雾', '长夜微雨与柔光尘埃', '透明海潮与发光雪粒', '热带雷云与银色极光'];
  const gravities = ['Low / 0.62g', 'Variable / soft drift', 'Reverse pockets', 'Earthlike with slow fall'];
  const civilizations = ['静默档案员在轨道桥之间传递记忆', '半透明旅人用光谱语言记录天气', '无人电车沿着悬空街区巡航', '灯塔城市每晚向星云广播梦境'];
  const palettes = [
    ['#7dd3fc', '#c084fc', '#f8fafc'],
    ['#22d3ee', '#f0abfc', '#facc15'],
    ['#a7f3d0', '#93c5fd', '#f9a8d4'],
    ['#bae6fd', '#ddd6fe', '#fef3c7'],
  ];
  const index = seed % names.length;

  return {
    name: `${names[index]} ${places[(seed + 2) % places.length]}`,
    subtitle: clean,
    climate: climates[seed % climates.length],
    gravity: gravities[(seed + 1) % gravities.length],
    civilization: civilizations[(seed + 2) % civilizations.length],
    firstScene: `你抵达“${clean}”。一条发光的引导线从脚下铺开，远处的建筑像动画片里的巨大剪影，慢慢亮起第一盏灯。`,
    palette: palettes[seed % palettes.length],
    tag: '新世界 / 科幻',
  };
};

export const CreateScreen: React.FC<CreateScreenProps> = ({
  songs,
  ambientSounds,
  onCreateSpace,
  onOpenProfile,
}) => {
  const [stage, setStage] = useState<Stage>('signal');
  const [signal, setSignal] = useState('');
  const [streamLines, setStreamLines] = useState<string[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const timersRef = useRef<number[]>([]);
  const blueprint = useMemo(() => makeBlueprint(signal), [signal]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => window.clearTimeout(timer));
    };
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach(timer => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const schedule = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timersRef.current.push(timer);
  };

  const startGeneration = () => {
    if (!signal.trim()) return;
    clearTimers();
    setSaved(false);
    setStreamLines([]);
    setLoadProgress(0);
    setStage('broadcast');

    BROADCAST_STEPS.forEach((line, index) => {
      schedule(() => {
        setStreamLines(prev => [...prev, `> ${line}`]);
      }, 260 + index * 360);
    });

    schedule(() => {
      setStage('loading');
      let progress = 0;
      const tick = window.setInterval(() => {
        progress += Math.max(3, Math.round((100 - progress) / 7));
        setLoadProgress(Math.min(progress, 100));
        if (progress >= 100) {
          window.clearInterval(tick);
          schedule(() => setStage('reveal'), 460);
        }
      }, 180);
      timersRef.current.push(tick);
    }, 3600);
  };

  const reset = () => {
    clearTimers();
    setStage('signal');
    setStreamLines([]);
    setLoadProgress(0);
    setSaved(false);
  };

  const saveWorld = () => {
    const song = songs.find(item => item.id === 'supernatural') || songs[0];
    const spaceSound = ambientSounds.find(sound => sound.id === 'space') || ambientSounds[0];
    const windSound = ambientSounds.find(sound => sound.id === 'wind');
    const imageIndex = blueprint.name.length % WORLD_IMAGES.length;
    const newSpace: Space = {
      id: `world_${Date.now()}`,
      title: blueprint.name,
      tag: selectedTag ? `${selectedTag} / 新世界` : blueprint.tag,
      creator: 'Building Your World',
      creatorAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=world-signal',
      bgImage: WORLD_IMAGES[imageIndex],
      ambientSounds: [
        { soundId: spaceSound.id, volume: 72 },
        ...(windSound ? [{ soundId: windSound.id, volume: 36 }] : []),
      ],
      defaultSongId: song.id,
      description: [
        blueprint.subtitle,
        `气候：${blueprint.climate}`,
        `重力：${blueprint.gravity}`,
        `文明痕迹：${blueprint.civilization}`,
        blueprint.firstScene,
      ].join('\n'),
      type: 'space',
    };

    onCreateSpace(newSpace);
    setSaved(true);
  };

  return (
    <div className="world-console relative min-h-screen overflow-hidden bg-[#05020a] px-5 pb-32 pt-7 text-white">
      <GalaxyBackdrop />

      <div className="relative z-10 flex min-h-[calc(100vh-9rem)] flex-col">
        <header className="flex items-center justify-end">
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="打开我的页面"
            className="h-11 w-11 overflow-hidden rounded-full border border-violet-200/20 bg-white/[0.04] shadow-[0_0_24px_rgba(124,103,150,0.18)] transition hover:border-violet-100/40 active:scale-95"
          >
            <img src={meAvatarUrl} alt="我的头像" className="h-full w-full object-cover" />
          </button>
        </header>

        <AnimatePresence mode="wait">
          {stage === 'signal' && (
            <motion.section
              key="signal"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              className="flex flex-1 flex-col justify-center gap-7"
            >
              <div className="space-y-3">
                <p className="text-4xl font-semibold leading-tight tracking-normal">寻觅我的专属空间</p>
                <p className="max-w-[18rem] text-sm leading-6 text-white/56">
                  调配画面、音乐和环境音，生成你的沉浸场景
                </p>
              </div>

              <div className="world-input-shell">
                <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-violet-100/60">
                  <span>Spatial Intent</span>
                  <span>Ready</span>
                </div>
                <textarea
                  value={signal}
                  onChange={(event) => setSignal(event.target.value)}
                  placeholder="比如：漂浮在木星风暴上的图书馆城市"
                  rows={4}
                  className="min-h-[128px] w-full resize-none bg-transparent text-xl font-medium leading-8 text-white outline-none placeholder:text-white/25"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  {SIGNAL_EXAMPLES.map(example => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setSignal(example)}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] text-white/70 transition hover:border-violet-200/30 hover:text-violet-100"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 pl-1">
                  <LucideIcon name="SlidersHorizontal" size={13} className="text-white/44" />
                  <h3 className="text-sm font-bold tracking-wide text-white/62">空间标签 / 调性（可选）</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <WorldTagButton label="无标签" active={selectedTag === ''} onClick={() => setSelectedTag('')} />
                  {WORLD_TAGS.map(tag => (
                    <WorldTagButton
                      key={tag}
                      label={tag}
                      active={selectedTag === tag}
                      onClick={() => setSelectedTag(tag)}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={startGeneration}
                disabled={!signal.trim()}
                className="group flex h-14 w-full items-center justify-center gap-2 rounded-[18px] border border-violet-100/32 bg-violet-100 text-sm font-bold uppercase tracking-[0.22em] text-black shadow-[0_18px_50px_rgba(124,103,150,0.24)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none"
              >
                <LucideIcon name="Sparkles" size={16} />
                Generate World
              </button>
            </motion.section>
          )}

          {stage === 'broadcast' && (
            <motion.section
              key="broadcast"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col justify-center"
            >
              <div className="mb-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-fuchsia-200/70">Prompt Broadcast</p>
                <h2 className="mt-2 text-3xl font-semibold">系统正在解码</h2>
              </div>
              <div className="world-terminal min-h-[300px] rounded-[8px] border border-violet-100/12 bg-black/40 p-5 font-mono text-[13px] leading-7 text-violet-100/82 shadow-[inset_0_0_40px_rgba(124,103,150,0.07)]">
                {streamLines.map((line, index) => (
                  <motion.div
                    key={`${line}-${index}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={index === streamLines.length - 1 ? 'text-white' : ''}
                  >
                    {line}
                  </motion.div>
                ))}
                <span className="world-cursor mt-2 inline-block h-4 w-2 bg-violet-200" />
              </div>
            </motion.section>
          )}

          {stage === 'loading' && (
            <motion.section
              key="loading"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="flex flex-1 flex-col justify-center gap-7"
            >
              <div className="text-center">
                <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-violet-200/60">Loading New World</p>
                <h2 className="mt-2 text-3xl font-semibold">{loadProgress}%</h2>
              </div>

              <div className="world-loader mx-auto">
                <div className="world-loader-core" />
                <div className="world-loader-ring world-loader-ring-a" />
                <div className="world-loader-ring world-loader-ring-b" />
                <div className="world-loader-scan" />
              </div>

              <div className="space-y-3">
                {LOADING_STEPS.map((item, index) => {
                  const visibleValue = Math.min(item.value, Math.max(0, loadProgress - index * 8));
                  return (
                    <div key={item.label} className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3 font-mono text-[10px] text-white/64">
                      <span>{item.label}</span>
                      <div className="h-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-violet-200 shadow-[0_0_14px_rgba(196,181,253,0.52)] transition-all duration-300"
                          style={{ width: `${visibleValue}%` }}
                        />
                      </div>
                      <span className="text-right text-violet-100">{visibleValue}%</span>
                    </div>
                  );
                })}
              </div>

              <p className="text-center text-xs leading-5 text-white/46">Tip: Some worlds remember their first visitor.</p>
            </motion.section>
          )}

          {stage === 'reveal' && (
            <motion.section
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col gap-5 pt-7"
            >
              <div className="world-reveal relative min-h-[320px] overflow-hidden rounded-[8px] border border-white/10">
                <img
                  src={WORLD_IMAGES[blueprint.name.length % WORLD_IMAGES.length]}
                  alt={blueprint.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,4,10,0.05),rgba(3,4,10,0.82))]" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-violet-100/70">New World Found</p>
                  <h2 className="mt-2 text-4xl font-semibold leading-none">{blueprint.name}</h2>
                  <p className="mt-3 text-sm leading-5 text-white/70">{blueprint.subtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {blueprint.palette.map(color => (
                  <div key={color} className="h-10 rounded-[8px] border border-white/10" style={{ background: color }} />
                ))}
              </div>

              <div className="space-y-3 rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
                <WorldFact label="Climate" value={blueprint.climate} />
                <WorldFact label="Gravity" value={blueprint.gravity} />
                <WorldFact label="Civilization" value={blueprint.civilization} />
              </div>

              <p className="rounded-[8px] border border-violet-100/12 bg-violet-100/[0.045] p-4 text-sm leading-6 text-violet-50/82">
                {blueprint.firstScene}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={reset}
                  className="h-12 rounded-[8px] border border-white/12 bg-white/[0.04] text-xs font-bold uppercase tracking-[0.18em] text-white/76"
                >
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={saveWorld}
                  disabled={saved}
                  className="h-12 rounded-[8px] border border-violet-100/32 bg-violet-100 text-xs font-bold uppercase tracking-[0.18em] text-black disabled:bg-emerald-200"
                >
                  {saved ? 'Saved' : 'Save World'}
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const WorldFact: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/36">{label}</p>
    <p className="mt-1 text-sm leading-5 text-white/82">{value}</p>
  </div>
);

const WorldTagButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`h-11 rounded-[13px] border px-3 text-sm font-bold tracking-wide transition active:scale-[0.98] ${
      active
        ? 'border-white/22 bg-white/[0.13] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_24px_rgba(0,0,0,0.18)]'
        : 'border-white/26 bg-black/12 text-white/58 hover:border-violet-100/38 hover:bg-white/[0.07] hover:text-white/78'
    }`}
  >
    {label}
  </button>
);

const GalaxyBackdrop: React.FC = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="world-galaxy" />
    <div className="world-stars world-stars-a" />
    <div className="world-stars world-stars-b" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(168,85,247,0.16),transparent_36%),linear-gradient(180deg,rgba(5,2,10,0),#05020a_86%)]" />
    <div className="world-scanlines" />
  </div>
);
