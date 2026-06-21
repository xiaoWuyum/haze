/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Space, Song } from '../types';
import { LucideIcon } from './LucideIcon';
import { motion, AnimatePresence } from 'motion/react';

interface PlazaScreenProps {
  spaces: Space[];
  mvs: Space[];
  recentSong: Song | null;
  isPlaying: boolean;
  onSelectSpace: (space: Space) => void;
  onTogglePlay: () => void;
  onOpenPlayer: () => void;
}

export const PlazaScreen: React.FC<PlazaScreenProps> = ({
  spaces,
  mvs,
  recentSong,
  isPlaying,
  onSelectSpace,
  onTogglePlay,
  onOpenPlayer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Filter systems
  const filteredSpaces = spaces.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMvs = mvs.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full pb-32">
      {/* Search Overlay Modal */}
      <AnimatePresence>
        {showSearchModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex flex-col px-6 pt-16"
          >
            <div className="max-w-md w-full mx-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-3 w-full">
                  <LucideIcon name="Search" className="text-zinc-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="搜索空间、曲风、创作者..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="bg-transparent text-white border-none outline-none text-base placeholder-zinc-500 w-full"
                  />
                </div>
                <button 
                  onClick={() => { setShowSearchModal(false); setSearchQuery(''); }}
                  className="text-zinc-500 hover:text-white px-2 py-1 text-sm bg-zinc-800/40 rounded-lg shrink-0"
                >
                  取消
                </button>
              </div>

              {/* Search Results */}
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
                {filteredSpaces.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase mb-2">精选空间成果</h4>
                    <div className="flex flex-col gap-2">
                      {filteredSpaces.map(space => (
                        <div 
                          key={space.id}
                          onClick={() => { onSelectSpace(space); setShowSearchModal(false); }}
                          className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/50 border border-white/5 cursor-pointer transition-colors"
                        >
                          <img 
                            src={space.bgImage} 
                            alt={space.title} 
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="truncate">
                            <h5 className="font-semibold text-white text-sm">{space.title}</h5>
                            <span className="text-xs text-zinc-400">{space.creator} · {space.tag}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredMvs.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase mb-2">MV 影厅成果</h4>
                    <div className="flex flex-col gap-2">
                      {filteredMvs.map(mv => (
                        <div 
                          key={mv.id}
                          onClick={() => { onSelectSpace(mv); setShowSearchModal(false); }}
                          className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/50 border border-white/5 cursor-pointer transition-colors"
                        >
                          <img 
                            src={mv.bgImage} 
                            alt={mv.title} 
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="truncate">
                            <h5 className="font-semibold text-white text-sm">{mv.title}</h5>
                            <span className="text-xs text-zinc-400">{mv.tag} · {mv.creator}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredSpaces.length === 0 && filteredMvs.length === 0 && (
                  <div className="text-center py-12">
                    <span className="text-sm text-zinc-500">未找到符合搜索条件的空间</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern App Header */}
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <div>
          <h1 className="text-[28px] font-bold text-white tracking-wide font-sans leading-none flex items-center gap-2">
            觅境
          </h1>
          <p className="text-[12px] text-zinc-400 mt-2 tracking-wider">为每首歌，找到它的空间</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            id="btn_search_launch"
            onClick={() => setShowSearchModal(true)}
            className="w-10 h-10 rounded-full bg-zinc-900/60 border border-white/5 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <LucideIcon name="Search" size={18} />
          </button>
          <div className="w-10 h-10 rounded-full bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center font-bold text-sm text-indigo-300 hover:border-indigo-400/50 transition-all cursor-pointer select-none">
            Sx
          </div>
        </div>
      </div>

      {/* Tab Sections list */}
      
      {/* 1. Spotlight Spaces */}
      <div id="sec_spotlight" className="px-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white tracking-wide font-sans">精选空间</h2>
          <span className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer select-none">查看全部</span>
        </div>

        {/* 2x2 Grid of Spotlight Cards precisely resembling the image layout */}
        <div className="grid grid-cols-2 gap-4">
          {spaces.map((space) => {
            // style mapping based on genre color accents
            const isCyber = space.tag.includes('赛博');
            const isWarm = space.tag.includes('暖') || space.tag.includes('静');
            const isCosmic = space.tag.includes('深');
            const accentBg = isCyber ? 'text-cyan-400 bg-cyan-950/60 border-cyan-500/20' : 
                             isWarm ? 'text-amber-400 bg-amber-950/60 border-amber-500/20' :
                             isCosmic ? 'text-purple-400 bg-purple-950/60 border-purple-500/20' :
                             'text-emerald-400 bg-emerald-950/60 border-emerald-500/20';

            return (
              <motion.div
                key={space.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectSpace(space)}
                className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-white/5 bg-zinc-900 transition-all duration-350 hover:border-white/10"
              >
                {/* Image backdrop */}
                <img
                  src={space.bgImage}
                  alt={space.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 filter brightness-[0.75]"
                  referrerPolicy="no-referrer"
                />

                {/* Shimmer gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-10" />

                {/* Space Tag (top left) */}
                <div className="absolute top-3 left-3 z-20">
                  <span className={`inline-block px-2.5 py-0.5 text-[9px] font-medium rounded-full border ${accentBg} backdrop-blur-md`}>
                    {space.tag}
                  </span>
                </div>

                {/* Space Info Box (bottom left) */}
                <div className="absolute bottom-3 left-3 right-3 z-20">
                  <h3 className="font-semibold text-white text-[13px] md:text-sm tracking-wide leading-tight group-hover:text-cyan-300 transition-colors truncate">
                    {space.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-400">
                    <span className="font-mono">{space.creator}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="truncate">{space.description?.split('。')[0] || '氛围声空间'}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 2. MV Theater */}
      <div id="sec_mv" className="px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white tracking-wide font-sans">MV 影厅</h2>
          <span className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer select-none">查看全部</span>
        </div>

        {/* Dynamic Row of MV Cards */}
        <div className="grid grid-cols-2 gap-4">
          {mvs.map((mv) => (
            <motion.div
              key={mv.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectSpace(mv)}
              className="group relative h-36 rounded-2xl overflow-hidden cursor-pointer shadow-md border border-white/5 bg-zinc-900 transition-all duration-350 hover:border-white/10"
            >
              <img
                src={mv.bgImage}
                alt={mv.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-[0.75]"
                referrerPolicy="no-referrer"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 z-10" />

              {/* Tag for MV indicator (top right) */}
              <div className="absolute top-2.5 right-2.5 z-20">
                <span className="inline-block px-2 py-0.5 text-[8px] font-bold text-red-400 bg-red-950/80 rounded-md border border-red-500/30 tracking-wider">
                  MV
                </span>
              </div>

              {/* MV Details */}
              <div className="absolute bottom-3 left-3 right-3 z-20">
                <h3 className="font-semibold text-white text-[13px] md:text-sm leading-tight uppercase group-hover:text-rose-400 transition-colors truncate">
                  {mv.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-400">
                  <span className="truncate pr-1">{mv.creator}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Listen / Recently Played anchored controller banner */}
      {recentSong && (
        <div className="px-6 mt-8">
          <h2 className="text-[12px] font-medium tracking-wider text-zinc-500 uppercase mb-3">最近在听</h2>
          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onOpenPlayer}
            className="flex items-center justify-between p-3.5 bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-2xl cursor-pointer hover:bg-zinc-800/60 transition-all select-none"
          >
            <div className="flex items-center gap-3.5 truncate">
              {/* Spinning Vinyl style disc */}
              <div className="relative w-12 h-12 rounded-full flex items-center justify-center bg-black overflow-hidden shadow-md group border border-white/5">
                <motion.img 
                  src={recentSong.coverUrl} 
                  alt={recentSong.title} 
                  animate={isPlaying ? { rotate: 360 } : {}}
                  transition={isPlaying ? { repeat: Infinity, duration: 8, ease: "linear" } : {}}
                  className="w-11 h-11 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute w-3 h-3 rounded-full bg-zinc-950 border-2 border-zinc-900 inset-0 m-auto flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                </div>
              </div>
              <div className="truncate text-left">
                <h4 className="font-semibold text-white text-[13px] leading-tight flex items-center gap-1.5">
                  {recentSong.title}
                  {isPlaying && (
                    <span className="flex items-center gap-[2px] h-2.5 w-3.5">
                      <span className="w-[1.5px] h-full bg-cyan-400 animate-[bounce_0.8s_infinite_delay-100]" />
                      <span className="w-[1.5px] h-full bg-cyan-400 animate-[bounce_0.8s_infinite_delay-300]" />
                      <span className="w-[1.5px] h-full bg-cyan-400 animate-[bounce_0.8s_infinite_delay-200]" />
                    </span>
                  )}
                </h4>
                <p className="text-[10px] text-zinc-400 mt-1">{recentSong.artist} · 上次播放</p>
              </div>
            </div>

            {/* Quick Play/Pause button */}
            <button 
              id="btn_play_trigger"
              onClick={(e) => {
                e.stopPropagation(); // prevent opening the full player
                onTogglePlay();
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/10 text-white shrink-0 hover:scale-105 active:scale-95 transition-all text-sm shadow-md"
            >
              <LucideIcon name={isPlaying ? 'Pause' : 'Play'} size={15} />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
