/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Space, Song, AmbientSound } from '../types';
import { LucideIcon } from './LucideIcon';
import { motion, AnimatePresence } from 'motion/react';
import { RECOMMENDER_LOGS, SCENE_TAGS } from '../utils/sceneRecommender';
import { getSceneRecommendation } from '../utils/sceneAiClient';
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
}

const DEFAULT_SCENE_IMAGE = 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1200&auto=format&fit=crop&q=80';
const PROMPT_PRESETS = ['东京雨夜', '温暖壁炉', '海边午后', '深空漂流'];

export const CreateScreen: React.FC<CreateScreenProps> = ({
  songs,
  ambientSounds,
  videoJob,
  generatedVideoUrl,
  videoError,
  isGeneratingVideo,
  onGenerateVideo,
  onClearVideoGeneration,
  onCreateSpace,
}) => {
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [genLogs, setGenLogs] = useState<string[]>([]);
  
  const [title, setTitle] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedSongId, setSelectedSongId] = useState(songs[0].id);
  const [submitError, setSubmitError] = useState('');
  const [createdList, setCreatedList] = useState<AmbientSound[]>(
    ambientSounds.map(s => ({ ...s, volume: 40, isPlaying: s.id === 'rain' }))
  );
  const [success, setSuccess] = useState(false);

  // AI Prompt expansion engine simulation matching user's exact three-tier logic
  const handleAIEnhance = () => {
    if (!userInput.trim()) return;
    setIsGenerating(true);
    setGenLogs([]);
    
    let logIndex = 0;
    const interval = setInterval(async () => {
      if (logIndex < RECOMMENDER_LOGS.length) {
        setGenLogs(prev => [...prev, RECOMMENDER_LOGS[logIndex]]);
        logIndex++;
      } else {
        clearInterval(interval);
        
        const recommendation = await getSceneRecommendation(userInput, songs);

        // Apply state updates simulating immediate smart layout creation
        setSelectedTag(recommendation.tag);
        setSelectedSongId(recommendation.songId);
        setTitle(recommendation.title);
        setEnhancedPrompt(`${recommendation.prompt}\n\n推荐原因：${recommendation.reason}`);
        setVideoPrompt(recommendation.videoPrompt);
        onClearVideoGeneration();
        
        // Setup initial sound mixes
        setCreatedList(prev => 
          prev.map(sound => ({
            ...sound,
            isPlaying: recommendation.activeSounds[sound.id] !== undefined,
            volume: recommendation.activeSounds[sound.id] !== undefined ? recommendation.activeSounds[sound.id] : 30
          }))
        );

        setIsGenerating(false);
      }
    }, 450);
  };

  const handleGenerateVideo = async () => {
    const prompt = videoPrompt || enhancedPrompt;
    if (!prompt.trim()) return;
    await onGenerateVideo(prompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!title.trim()) return;
    if (!generatedVideoUrl) {
      setSubmitError('请先生成视频，再发布场景。');
      return;
    }

    const activeAtmosphereMix = createdList
      .filter(s => s.isPlaying)
      .map(s => ({ soundId: s.id, volume: s.volume }));

    const newSpace: Space = {
      id: `custom_${Date.now()}`,
      title: title.trim(),
      tag: selectedTag,
      creator: 'Sx (我)',
      creatorAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=creator',
      bgImage: DEFAULT_SCENE_IMAGE,
      videoUrl: generatedVideoUrl,
      ambientSounds: activeAtmosphereMix.length > 0 ? activeAtmosphereMix : [{ soundId: 'rain', volume: 50 }],
      defaultSongId: selectedSongId,
      description: enhancedPrompt 
        ? `使用 AI 增强型创作指令：${enhancedPrompt}\n\n视频生成 Prompt：${videoPrompt || '未生成'}`
        : `这是由你量身定制的浪漫放松氛围“${title}”，搭配优雅的键盘配器音乐和大自然音，尽享内心的静谧安逸。`,
      type: 'space'
    };

    onCreateSpace(newSpace);
    setSuccess(true);
    
    // Auto reset form
    setTitle('');
    setUserInput('');
    setEnhancedPrompt('');
    setVideoPrompt('');
    setSubmitError('');
    onClearVideoGeneration();
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <div className="w-full px-6 pt-8 pb-32 max-w-md mx-auto relative create-studio">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide font-sans">创建空间</h1>
          <p className="text-xs text-zinc-400 mt-1.5">调配画面、音乐和环境音，生成你的沉浸场景</p>
        </div>
        <div className="h-10 w-10 overflow-hidden rounded-full border border-white/15 bg-zinc-900 shadow-md shrink-0">
          <img src={meAvatarUrl} alt="我的头像" className="h-full w-full object-cover" />
        </div>
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
      <div className="create-silk-panel mb-6 p-5 rounded-2xl border border-cyan-300/15 flex flex-col gap-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">AI Scene Studio</h3>
          </div>
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-mono text-zinc-400">
            {isGenerating ? 'SYNC' : 'READY'}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <textarea
            placeholder="例如: 赛博朋克下的东京雨夜... 或者 温暖壁炉与小木屋... 或者 飞驰的街道..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isGenerating}
            rows={2}
            className="w-full px-3 py-3 bg-black/35 border border-white/10 disabled:opacity-50 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-400/40 transition-all font-sans leading-relaxed text-left resize-none shadow-inner"
          />
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {PROMPT_PRESETS.map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => setUserInput(preset)}
                className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-semibold text-zinc-300 hover:border-cyan-300/30 hover:text-cyan-200 transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAIEnhance}
            disabled={isGenerating || !userInput.trim()}
            className="w-full py-2.5 rounded-xl bg-cyan-300 text-black border border-cyan-100/40 hover:bg-cyan-200 disabled:opacity-40 disabled:hover:bg-cyan-300 text-[10px] font-bold tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all shadow-[0_10px_28px_rgba(34,211,238,0.16)]"
          >
            <LucideIcon name="Sparkles" size={11} className={isGenerating ? "animate-spin" : ""} />
            <span>{isGenerating ? "正在通过 AI 增强管道解析中..." : "智能增强，适配画幅与大自然音"}</span>
          </button>
        </div>

        {/* Dynamic Logging Feed */}
        {genLogs.length > 0 && (
          <div className="p-3 rounded-xl bg-black/45 border border-cyan-300/10 font-mono text-[9px] text-cyan-300/90 leading-relaxed text-left max-h-32 overflow-y-auto flex flex-col gap-1 shadow-inner">
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
            className="p-3 rounded-xl bg-black/25 border border-cyan-300/20 text-xs text-cyan-300 flex flex-col gap-1.5 text-left"
          >
            <div className="flex items-center gap-1.5 leading-none">
              <LucideIcon name="PartyPopper" size={11} className="text-cyan-400" />
              <span className="font-bold text-[10px] uppercase tracking-wider">Prompt 增强与音景配置已同步!</span>
            </div>
            <p className="text-[10px] text-cyan-400/80 leading-relaxed italic bg-black/20 p-2 rounded-lg font-mono">
              "{enhancedPrompt}"
            </p>
            <div className="rounded-lg bg-black/25 border border-cyan-500/10 p-2">
              <div className="flex items-center gap-1.5 mb-1">
                <LucideIcon name="Clapperboard" size={10} className="text-cyan-400" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-300">Video Loop Prompt</span>
              </div>
              <p className="text-[10px] text-zinc-300 leading-relaxed font-mono">{videoPrompt}</p>
            </div>
            <button
              type="button"
              onClick={handleGenerateVideo}
              disabled={isGeneratingVideo || !videoPrompt.trim()}
              className="mt-1 w-full py-2 rounded-lg bg-white text-black disabled:opacity-40 text-[10px] font-bold tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
            >
              <LucideIcon name={isGeneratingVideo ? "Loader2" : "Video"} size={11} className={isGeneratingVideo ? "animate-spin" : ""} />
              <span>{isGeneratingVideo ? "生成循环视频中..." : generatedVideoUrl ? "重新生成视频" : "生成背景视频"}</span>
            </button>
            {videoJob && (
              <div className="text-[9px] text-zinc-500 flex items-center justify-between gap-2">
                <span>Provider: {videoJob.provider}</span>
                <span>Status: {videoJob.status}</span>
              </div>
            )}
            {videoError && (
              <div className="text-[9px] text-red-300 bg-red-950/30 border border-red-500/20 rounded-lg px-2 py-1.5">
                {videoError}
              </div>
            )}
            {generatedVideoUrl && (
              <video
                src={generatedVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="mx-auto w-full max-w-[220px] aspect-[9/16] object-cover rounded-lg border border-white/10 bg-black"
              />
            )}
            <div className="text-[9px] text-zinc-500 flex items-center gap-1 mt-0.5">
              <LucideIcon name="CornerRightDown" size={9} />
              <span>已同步下方：场景名称、默认主题曲、大气音音控轨道；生成视频后发布会优先使用新 videoUrl</span>
            </div>
          </motion.div>
        )}
      </div>

      {generatedVideoUrl && !enhancedPrompt && (
        <div className="mb-6 p-4 rounded-2xl bg-zinc-900/50 border border-emerald-500/20 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3 text-emerald-300">
            <LucideIcon name="CheckCircle2" size={14} />
            <span className="text-[11px] font-bold tracking-wider">视频已生成，可继续完善场景并发布</span>
          </div>
          <video
            src={generatedVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="mx-auto w-full max-w-[220px] aspect-[9/16] object-cover rounded-xl border border-white/10 bg-black"
          />
        </div>
      )}

      <div className="flex items-center gap-2 mb-3.5 pl-1">
        <LucideIcon name="SlidersHorizontal" size={12} className="text-zinc-500" />
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">场景参数详情与人工微调</h4>
      </div>

      <form onSubmit={handleSubmit} className="create-control-panel flex flex-col gap-5 p-5 rounded-2xl border border-white/10">
        
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
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">空间标签 / 调性（可选）</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedTag('')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                selectedTag === ''
                  ? 'bg-white/10 border-white/20 text-white shadow-md'
                  : 'bg-black/20 border-zinc-805 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              无标签
            </button>
            {SCENE_TAGS.map(tag => (
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

        {/* 3. Select default theme song */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">默认主题音乐</label>
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

        {/* Create action button */}
        {submitError && (
          <div className="text-[10px] text-red-300 bg-red-950/30 border border-red-500/20 rounded-xl px-3 py-2">
            {submitError}
          </div>
        )}

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

