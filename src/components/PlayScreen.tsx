/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Space, Song, AmbientSound } from '../types';
import { LucideIcon } from './LucideIcon';
import { VisualEffects } from './VisualEffects';
import { VisualBeat } from './VisualBeat';
import { motion, AnimatePresence } from 'motion/react';
import { readJson, writeJson } from '../utils/storage';

interface PlayScreenProps {
  space: Space;
  songs: Song[];
  songVolume: number;
  activeSongId: string;
  isPlaying: boolean;
  ambientSounds: AmbientSound[];
  freqData: number[]; // From analyser
  onTogglePlay: () => void;
  onSetSongVolume: (vol: number) => void;
  onSetAmbientVolume: (soundId: string, vol: number) => void;
  onToggleAmbientSound: (soundId: string) => void;
  onSelectSong: (songId: string) => void;
  onClose: () => void;
}

interface PlaylistItem {
  id: string;
  title: string;
  image: string;
  songs: string[]; // Song IDs associated
  tag?: string;
  isSpecialStar?: boolean;
}

const PLAYLISTS: PlaylistItem[] = [
  {
    id: 'favs',
    title: '华语 R&B',
    image: '',
    songs: ['ordinary_friends', 'airport_1030', 'hongdou'],
    tag: 'Chinese R&B',
    isSpecialStar: true
  },
  {
    id: 'pop',
    title: 'Pop Icons',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    songs: ['billie_jean', 'how_sweet'],
    tag: 'Pop'
  },
  {
    id: 'kpop',
    title: 'K-Pop',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    songs: ['how_sweet'],
    tag: 'K-Pop'
  },
  {
    id: 'indie',
    title: 'Indie Night',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&auto=format&fit=crop&q=80',
    songs: ['xiaoban', 'hongdou'],
    tag: 'Indie'
  },
  {
    id: 'city',
    title: 'City Drive',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=150&auto=format&fit=crop&q=80',
    songs: ['not_like_us', 'airport_1030', 'ordinary_friends', 'billie_jean'],
    tag: 'City'
  }
];

export const PlayScreen: React.FC<PlayScreenProps> = ({
  space,
  songs,
  songVolume,
  activeSongId,
  isPlaying,
  ambientSounds,
  freqData,
  onTogglePlay,
  onSetSongVolume,
  onSetAmbientVolume,
  onToggleAmbientSound,
  onSelectSong,
  onClose,
}) => {
  const [activePlaylistId, setActivePlaylistId] = useState<string>('city');
  const [showMixer, setShowMixer] = useState<boolean>(true);
  const [favorite, setFavorite] = useState<boolean>(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null); // minutes
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  const activeSong = songs.find(s => s.id === activeSongId) || songs[0];

  // Sync favorites of current space
  useEffect(() => {
    const favorites = readJson<string[]>('saved_space_favorites', []);
    setFavorite(favorites.includes(space.id));
  }, [space.id]);

  const toggleFavorite = () => {
    const favorites = readJson<string[]>('saved_space_favorites', []);
    let updated: string[];
    if (favorites.includes(space.id)) {
      updated = favorites.filter((id: string) => id !== space.id);
      setFavorite(false);
    } else {
      updated = [...favorites, space.id];
      setFavorite(true);
    }
    writeJson('saved_space_favorites', updated);
  };

  // Sleep Timer countdown
  useEffect(() => {
    if (secondsRemaining === null) return;
    if (secondsRemaining <= 0) {
      if (isPlaying) {
        onTogglePlay();
      }
      setSleepTimer(null);
      setSecondsRemaining(null);
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev === null) return null;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining, isPlaying]);

  const setTimerAction = (minutes: number | null) => {
    setSleepTimer(minutes);
    if (minutes === null) {
      setSecondsRemaining(null);
    } else {
      setSecondsRemaining(minutes * 60);
    }
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleNextSong = () => {
    const currentIdx = songs.findIndex(s => s.id === activeSongId);
    const nextIdx = (currentIdx + 1) % songs.length;
    onSelectSong(songs[nextIdx].id);
  };

  const handlePrevSong = () => {
    const currentIdx = songs.findIndex(s => s.id === activeSongId);
    const prevIdx = (currentIdx - 1 + songs.length) % songs.length;
    onSelectSong(songs[prevIdx].id);
  };

  // Switch songs inside active playlist
  const activePlaylist = PLAYLISTS.find(p => p.id === activePlaylistId) || PLAYLISTS[4];
  const playlistSongs = songs.filter(s => activePlaylist.songs.includes(s.id));

  return (
    <div className="absolute inset-0 bg-[#09090b] z-40 overflow-y-auto flex flex-col focus:outline-none select-none">
      
      {/* Immersive scene media. Generated video wins; generated/selected image is the fallback. */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-black">
        {space.videoUrl ? (
          <video
            key={space.videoUrl}
            src={space.videoUrl}
            poster={space.bgImage}
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          />
        ) : (
          <img
            src={space.bgImage}
            alt={space.title}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/45 to-black/20" />
      </div>

      {/* Dynamic atmospheric canvas effects */}
      <VisualEffects type="rain" freqData={freqData} />

      {/* Main Container */}
      <div className="relative z-20 flex flex-col flex-1 px-5 pt-8 pb-36 max-w-md mx-auto w-full">
        
        {/* PREMIUM TOP HEADER WITH METICULOUS CAPSULE BUTTONS ALIGNED TO IMAGE */}
        <div className="flex items-center justify-between">
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-white transition-all cursor-pointer"
          >
            <LucideIcon name="ChevronLeft" size={20} />
          </button>

          {/* Combined Plus, Queue and Menu options Pill */}
          <div className="bg-zinc-900/90 border border-white/5 rounded-full px-4 py-1.5 flex items-center gap-4 shadow-lg shrink-0">
            <button 
              onClick={() => alert('已将当前白噪音和弦场景添加至您的私人播放列表')}
              className="text-zinc-400 hover:text-[#4ade80] transition-colors cursor-pointer"
              title="添加歌曲"
            >
              <LucideIcon name="Plus" size={17} />
            </button>
            <button 
              onClick={() => setShowMixer(prev => !prev)}
              className={`transition-colors cursor-pointer ${showMixer ? 'text-[#4ade80]' : 'text-zinc-400 hover:text-[#4ade80]'}`}
              title="混音通道"
            >
              <LucideIcon name="Sliders" size={15} />
            </button>
            <button 
              onClick={toggleFavorite}
              className={`transition-colors cursor-pointer ${favorite ? 'text-red-500 animate-pulse' : 'text-zinc-400 hover:text-white'}`}
              title="收藏"
            >
              <LucideIcon name="Heart" size={15} />
            </button>
          </div>
        </div>

        {/* LARGE DISPLAY TITLE MATED TO SCREENSHOT */}
        <div className="mt-8 flex items-baseline justify-between">
          <h1 className="text-2xl font-black text-white font-sans tracking-wide">播放列表</h1>
          <span className="text-[10px] font-mono font-bold text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80]/20 px-2 py-0.5 rounded-full">绿野仙踪 · Green Theme</span>
        </div>

        {/* 1. PLAYLIST CHANNELS LIST - PERFECT SCREENSHOT COPIER */}
        <div className="flex flex-col mt-5 gap-0.5 bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
          {PLAYLISTS.map((pl) => {
            const isSelected = activePlaylistId === pl.id;

            return (
              <div
                key={pl.id}
                onClick={() => {
                  setActivePlaylistId(pl.id);
                  // Auto load the first song in that custom sub playlist
                  onSelectSong(pl.songs[0]);
                }}
                className={`group flex items-center justify-between px-4 py-3 cursor-pointer transition-all border-b border-white/[0.02] last:border-0 ${
                  isSelected ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Thumbnail Cover Art wrapper corresponding to style */}
                  {pl.isSpecialStar ? (
                    <div className="w-12 h-12 rounded-xl bg-white border border-white/10 flex items-center justify-center shrink-0 shadow-md">
                      <LucideIcon name="Star" size={24} className="text-red-500 fill-red-500 animate-pulse" />
                    </div>
                  ) : (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md">
                      <img 
                        src={pl.image} 
                        alt={pl.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Playlist Label & Active glowing cursor indicator */}
                  <div className="text-left">
                    <h3 className={`text-[13px] font-bold transition-colors tracking-wide ${
                      isSelected ? 'text-[#4ade80]' : 'text-zinc-200 group-hover:text-white'
                    }`}>
                      {pl.title}
                    </h3>
                    <span className="text-[10px] text-zinc-500 mt-1 block font-mono">
                      {pl.songs.length} 首和弦曲目 · 混音
                    </span>
                  </div>
                </div>

                {/* Right caret chevron */}
                <div className="flex items-center gap-2">
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80]" />
                  )}
                  <LucideIcon name="ChevronRight" size={14} className={isSelected ? 'text-[#4ade80]' : 'text-zinc-650'} />
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. NESTED AUDIO TRACKS LISTING - HIGHLY INTERACTIVE */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <h4 className="text-[11px] font-black tracking-widest text-zinc-400 uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
              当前歌单单曲轨道 ({activePlaylist.title})
            </h4>
            <span className="text-[10px] text-zinc-500 font-mono">Select to Play</span>
          </div>

          <div className="flex flex-col gap-2">
            {playlistSongs.length > 0 ? (
              playlistSongs.map((song) => {
                const isCurrent = activeSongId === song.id;

                return (
                  <div
                    key={song.id}
                    onClick={() => onSelectSong(song.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#4ade80]/5 border-[#4ade80]/30 shadow-sm'
                        : 'bg-zinc-900/20 border-white/5 hover:border-white/10 hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={song.coverUrl} 
                        alt={song.title} 
                        className="w-9 h-9 rounded-lg object-cover shrink-0 border border-white/5"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left min-w-0">
                        <h5 className={`text-xs font-bold truncate leading-snug ${
                          isCurrent ? 'text-[#4ade80]' : 'text-white'
                        }`}>
                          {song.title}
                        </h5>
                        <p className="text-[10px] text-zinc-500 truncate mt-0.5">{song.artist} · {song.genre}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isCurrent && isPlaying ? (
                        <div className="flex gap-[2px] items-end h-3 mr-1">
                          <span className="w-[2px] h-2 bg-[#4ade80] animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <span className="w-[2px] h-3 bg-[#4ade80] animate-bounce" style={{ animationDelay: '0.3s' }} />
                          <span className="w-[2px] h-1 bg-[#4ade80] animate-bounce" style={{ animationDelay: '0.5s' }} />
                        </div>
                      ) : (
                        isCurrent && <LucideIcon name="Volume2" size={13} className="text-[#4ade80]" />
                      )}
                      <span className="text-[10px] font-mono text-zinc-500">3:00</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 border border-dashed border-white/5 rounded-2xl text-center text-xs text-zinc-500">
                暂无和弦曲目
              </div>
            )}
          </div>
        </div>

        {/* 3. GREEN AUDIO SPIKES EQUALIZER INTEGRATION */}
        <div className="mt-8 mb-4">
          <VisualBeat isPlaying={isPlaying} freqData={freqData} colorTheme="ocean" />
        </div>

        {/* 4. SLEEP TIMER & WHITE NOISE LAYER ACCORDION CONTROLLABLE */}
        <AnimatePresence>
          {showMixer && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 mb-2 overflow-hidden"
            >
              <div className="bg-zinc-900/50 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex flex-col gap-4">
                
                {/* Micro menu header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                    <LucideIcon name="Settings" size={11} className="text-[#4ade80] animate-spin-slow" />
                    多轨大自然白噪音混音调控 (三层空间音控)
                  </span>

                  {/* Redone Sleep timer badge in neon green */}
                  <button 
                    onClick={() => {
                      if (sleepTimer === null) setTimerAction(15);
                      else if (sleepTimer === 15) setTimerAction(30);
                      else if (sleepTimer === 30) setTimerAction(60);
                      else setTimerAction(null);
                    }}
                    className={`flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono border rounded-md cursor-pointer transition-colors ${
                      sleepTimer 
                        ? 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/30 font-bold' 
                        : 'bg-transparent text-zinc-500 border-zinc-800 hover:text-zinc-300'
                    }`}
                  >
                    <LucideIcon name="Clock" size={10} />
                    <span>{sleepTimer ? formatTime(secondsRemaining || 0) : "睡眠关机"}</span>
                  </button>
                </div>

                {/* Main music volume line */}
                <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                      <LucideIcon name="Music" className="text-[#4ade80]" size={12} />
                      和弦原声音乐 ({activeSong.title})
                    </span>
                    <span className="text-[#4ade80] text-[10px] font-mono">{songVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={songVolume}
                    onChange={(e) => onSetSongVolume(parseInt(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg cursor-pointer appearance-none accent-[#4ade80]"
                  />
                </div>

                {/* Multi track loops */}
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-0.5">
                  {ambientSounds.map((sound) => {
                    const isActive = sound.isPlaying;

                    return (
                      <div
                        key={sound.id}
                        className={`flex items-center gap-3 px-2.5 py-1.5 rounded-xl border transition-all ${
                          isActive 
                            ? 'bg-zinc-950/60 border-white/5' 
                            : 'bg-transparent border-transparent opacity-40 hover:opacity-100'
                        }`}
                      >
                        {/* Circle badge */}
                        <button
                          onClick={() => onToggleAmbientSound(sound.id)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all text-sm shrink-0 ${
                            isActive 
                              ? 'bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30' 
                              : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                          }`}
                        >
                          <LucideIcon name={sound.icon} size={13} />
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className={`font-semibold ${isActive ? 'text-zinc-200' : 'text-zinc-500'}`}>
                              {sound.name}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-mono">{sound.volume}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={sound.volume}
                            disabled={!isActive}
                            onChange={(e) => onSetAmbientVolume(sound.id, parseInt(e.target.value))}
                            className="w-full h-[3px] bg-zinc-800 rounded-lg appearance-none cursor-pointer disabled:opacity-25 accent-[#4ade80]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* 5. IMMERSIVE PERSISTENT FLOATING BOTTOM PLAYER CAPSULE - DIRECT SCREENSHOT FIT */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 px-5 pb-6 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent pt-6">
        <div 
          onClick={onTogglePlay}
          className="flex items-center justify-between px-4 py-3 bg-zinc-900 border border-white/5 backdrop-blur-xl rounded-2xl shadow-2xl hover:bg-zinc-850 cursor-pointer transition-all border-l-2 border-l-[#4ade80]"
        >
          {/* Cover & metadata labels */}
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Spinning artwork indicator */}
            <motion.div 
              animate={isPlaying ? { rotate: 360 } : {}}
              transition={isPlaying ? { repeat: Infinity, duration: 15, ease: "linear" } : {}}
              className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-white/10 shadow-[0_0_8px_rgba(74,222,128,0.2)]"
            >
              <img 
                src={activeSong.coverUrl} 
                alt={activeSong.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            <div className="text-left min-w-0">
              <h2 className="font-bold text-sm text-white tracking-wide truncate leading-tight flex items-center gap-1">
                {activeSong.title}
                {isPlaying && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-ping shrink-0" />
                )}
              </h2>
              <p className="text-[10px] text-zinc-500 font-semibold tracking-wide mt-1 truncate">{activeSong.artist}</p>
            </div>
          </div>

          {/* Right quick actions: Pause / Play custom triggers */}
          <div className="flex items-center gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onTogglePlay}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black/35 hover:bg-black/60 text-[#4ade80] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="播放/暂停"
            >
              <LucideIcon name={isPlaying ? 'Pause' : 'Play'} size={15} />
            </button>
            <button
              onClick={handleNextSong}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black/35 hover:bg-black/60 text-[#4ade80] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="下一首"
            >
              <LucideIcon name="SkipForward" size={15} />
            </button>
          </div>
        </div>

        {/* Micro playing progress indicator wrapper */}
        <div className="w-[92%] h-[2px] mx-auto bg-zinc-800 rounded-full mt-2.5 overflow-hidden">
          <motion.div
            initial={{ width: "10%" }}
            animate={isPlaying ? { width: "95%" } : { width: "42%" }}
            transition={{ duration: 180, ease: "linear" }}
            className="h-full bg-gradient-to-r from-[#4ade80] to-emerald-500 rounded-full"
          />
        </div>
      </div>

    </div>
  );
};

