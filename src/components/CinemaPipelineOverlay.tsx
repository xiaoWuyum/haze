/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LucideIcon } from './LucideIcon';
import type { VideoGenerationJob } from '../utils/videoGenerationClient';

interface CinemaPipelineOverlayProps {
  job: VideoGenerationJob | null;
  prompt: string;
  title: string;
  subtitle: string;
  videoUrl: string;
  errorMessage: string;
  isGenerating: boolean;
  onClose: () => void;
  onRegenerate: () => void;
  onPublishToPlaza: () => void;
  onPlayInScene: () => void;
}

const RENDER_PHASES = [
  { label: 'submitting prompt', zh: '提交场景提示词' },
  { label: 'computing seed', zh: '计算随机种子' },
  { label: 'rendering first frame', zh: '渲染首帧' },
  { label: 'composing motion', zh: '合成动态' },
  { label: 'encoding stream', zh: '编码流媒体' },
];

export const CinemaPipelineOverlay: React.FC<CinemaPipelineOverlayProps> = ({
  job,
  prompt,
  title,
  subtitle,
  videoUrl,
  errorMessage,
  isGenerating,
  onClose,
  onRegenerate,
  onPublishToPlaza,
  onPlayInScene,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [muted, setMuted] = useState(true);

  const status = job?.status || (errorMessage ? 'failed' : 'queued');
  const isCompleted = status === 'completed' && !!videoUrl;
  const isFailed = status === 'failed' || !!errorMessage;
  const isProcessing = !isCompleted && !isFailed;

  // Drive the staged progress phases during processing
  useEffect(() => {
    if (!isProcessing) {
      setPhaseIndex(0);
      return;
    }
    setPhaseIndex(0);
    const interval = window.setInterval(() => {
      setPhaseIndex(prev => (prev + 1) % RENDER_PHASES.length);
    }, 1400);
    return () => window.clearInterval(interval);
  }, [isProcessing]);

  // Autoplay & loop when completed
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isCompleted) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          /* autoplay may be blocked, user can press play */
        });
      }
    } else {
      video.pause();
    }
  }, [isCompleted, videoUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-y-0 left-0 right-0 z-[200] mx-auto flex max-w-md flex-col overflow-hidden bg-black shadow-2xl"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(124,103,250,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.01)_0,rgba(255,255,255,0.01)_1px,transparent_1px,transparent_4px)]" />
      </div>

      {/* Header */}
      {!isCompleted && (
        <header className="relative z-20 flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
              <LucideIcon name="Clapperboard" size={18} className="text-violet-200" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-violet-200/60">Cinema Pipeline</p>
              <h2 className="text-sm font-bold text-white/90">渲染中心</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <LucideIcon name="X" size={20} />
          </button>
        </header>
      )}

      {/* Main Content Area */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {!isCompleted ? (
            <main key="processing" className="relative z-10 flex flex-1 flex-col items-center px-6 py-4 overflow-y-auto scrollbar-hide">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="my-auto flex w-full max-w-sm flex-col items-center gap-8"
              >
                {/* Central Orb/Visual */}
                <div className="relative flex h-48 w-48 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-violet-500/20 animate-[pulse_3s_infinite]" />
                  <div className="absolute inset-4 rounded-full border border-violet-400/30 animate-[pulse_2s_infinite]" />
                  <div className="absolute inset-8 rounded-full border border-cyan-400/20" />
                  
                  <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${isFailed ? 'from-red-400 to-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)]' : 'from-violet-400 to-violet-600 shadow-[0_0_50px_rgba(124,103,250,0.5)]'} flex items-center justify-center relative z-10`}>
                    <LucideIcon name={isFailed ? "TriangleAlert" : "Loader2"} size={28} className={`text-white ${!isFailed ? 'animate-spin' : ''}`} />
                  </div>

                  {/* Rotating Rings */}
                  {!isFailed && (
                    <>
                      <div className="absolute inset-0 rounded-full border-t-2 border-violet-400/40 animate-[spin_3s_linear_infinite]" />
                      <div className="absolute inset-2 rounded-full border-b-2 border-cyan-400/40 animate-[spin_4s_linear_infinite_reverse]" />
                    </>
                  )}
                </div>

                {/* Status Info */}
                <div className="w-full space-y-4 text-center">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-semibold text-white">
                      {isFailed ? '生成未成功' : title || '正在渲染场景'}
                    </h3>
                    <p className="mx-auto max-w-[80%] text-sm leading-relaxed text-white/50">
                      {isFailed ? errorMessage : '正在将你的想象转化为 5s 循环视觉体验...'}
                    </p>
                  </div>

                  {/* Cinematic Hint moved up */}
                  <div className="opacity-40">
                    <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-white">
                      Cinematic · 5s Seamless Loop · 720x1280
                    </p>
                  </div>

                  {/* Progress Phases */}
                  {!isFailed && (
                    <div className="mt-6 space-y-2 rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
                      {RENDER_PHASES.map((phase, index) => {
                        const active = index === phaseIndex;
                        const passed = index < phaseIndex;
                        return (
                          <div key={phase.label} className="flex items-center gap-3 font-mono text-[11px]">
                            <div className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${active ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300' : passed ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : 'border-white/10 text-white/20'}`}>
                              {active ? (
                                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
                              ) : passed ? (
                                <LucideIcon name="Check" size={10} />
                              ) : (
                                <div className="h-1 w-1 rounded-full bg-current" />
                              )}
                            </div>
                            <span className={`flex-1 text-left uppercase tracking-widest transition-colors ${active ? 'text-cyan-100' : passed ? 'text-emerald-100/70' : 'text-white/20'}`}>
                              {phase.zh}
                            </span>
                            <span className={`tabular-nums transition-colors ${active ? 'text-cyan-300' : passed ? 'text-emerald-300/60' : 'text-white/10'}`}>
                              {active ? '...' : passed ? 'OK' : '·'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isFailed && (
                    <button
                      onClick={onRegenerate}
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                    >
                      <LucideIcon name="RotateCcw" size={16} />
                      重试生成
                    </button>
                  )}
                </div>
              </motion.div>
            </main>
          ) : (
            <motion.div
              key="completed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col"
            >
              {/* Fullscreen Video Content */}
              <div className="relative flex-1 bg-black">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  muted={muted}
                  loop
                  playsInline
                  autoPlay
                  className="h-full w-full object-cover"
                />
                
                {/* Video Overlays */}
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.4)_20%,transparent_50%,rgba(0,0,0,0.4)_100%)]" />
                
                {/* Close button for completed state */}
                <button
                  onClick={onClose}
                  className="absolute right-6 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 backdrop-blur-md transition hover:bg-black/60 hover:text-white"
                >
                  <LucideIcon name="X" size={20} />
                </button>

                {/* Meta Tags */}
                <div className="absolute left-6 top-6 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-200 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    live render
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white/70 backdrop-blur-md">
                    5s loop
                  </span>
                </div>

                {/* Mute Toggle */}
                <div className="absolute right-6 top-20">
                  <button
                    onClick={() => setMuted(!muted)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 backdrop-blur-md transition hover:bg-black/60 hover:text-white"
                  >
                    <LucideIcon name={muted ? "VolumeX" : "Volume2"} size={18} />
                  </button>
                </div>

                {/* Title & Info at Bottom */}
                <div className="absolute inset-x-0 bottom-30 px-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {/* <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-violet-300/80">World Premiere</p> */}
                      <h2 className="text-3xl font-bold text-white drop-shadow-2xl">{title}</h2>
                      {subtitle && <p className="max-w-[90%] text-sm leading-relaxed text-white/70 drop-shadow-md">{subtitle}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions for Completed State */}
              <div className="bottom-33 relative z-10 grid grid-cols-2 gap-4  px-6 py-8">
                <button
                  onClick={onPublishToPlaza}
                  className="flex h-10 items-center justify-center gap-2 rounded-2xl border border-violet-400/30 bg-violet-500/10 text-sm font-bold uppercase tracking-widest text-violet-100 transition hover:bg-violet-500/20 active:scale-[0.98]"
                >
                  <LucideIcon name="Send" size={18} />
                  发布到广场
                </button>
                <button
                  onClick={onPlayInScene}
                  className="flex h-10 items-center justify-center gap-3 rounded-2xl bg-violet-100 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-white active:scale-[0.98]"
                >
                  <LucideIcon name="Play" size={18} />
                  进入播放
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
