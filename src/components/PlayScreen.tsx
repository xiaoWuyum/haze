/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
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
  freqData: number[];
  onTogglePlay: () => void;
  onSetSongVolume: (vol: number) => void;
  onSetAmbientVolume: (soundId: string, vol: number) => void;
  onToggleAmbientSound: (soundId: string) => void;
  onSelectSong: (songId: string) => void;
  onClose: () => void;
}

type PanelTab = 'songs' | 'ambience' | 'effects';

interface PlaylistItem {
  id: string;
  title: string;
  songs: string[];
  tag: string;
}

const PLAYLISTS: PlaylistItem[] = [
  { id: 'rnb', title: '华语 R&B', songs: ['ordinary_friends', 'airport_1030', 'hongdou'], tag: 'Chinese R&B' },
  { id: 'pop', title: 'Pop Icons', songs: ['billie_jean', 'how_sweet'], tag: 'Pop' },
  { id: 'kpop', title: 'K-Pop', songs: ['how_sweet'], tag: 'K-Pop' },
  { id: 'indie', title: 'Indie Night', songs: ['xiaoban', 'hongdou'], tag: 'Indie' },
  { id: 'city', title: 'City Drive', songs: ['not_like_us', 'airport_1030', 'ordinary_friends', 'billie_jean'], tag: 'City' },
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
  const [activePlaylistId, setActivePlaylistId] = useState('city');
  const [activeTab, setActiveTab] = useState<PanelTab>('songs');
  const [panelOpen, setPanelOpen] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [showChrome, setShowChrome] = useState(true);

  const activeSong = songs.find(song => song.id === activeSongId) || songs[0];
  const activePlaylist = PLAYLISTS.find(playlist => playlist.id === activePlaylistId) || PLAYLISTS[4];
  const playlistSongs = songs.filter(song => activePlaylist.songs.includes(song.id));
  const activeAmbients = ambientSounds.filter(sound => sound.isPlaying);

  useEffect(() => {
    const favorites = readJson<string[]>('saved_space_favorites', []);
    setFavorite(favorites.includes(space.id));
  }, [space.id]);

  useEffect(() => {
    if (!showChrome || panelOpen) return;
    const timeout = window.setTimeout(() => setShowChrome(false), 3200);
    return () => window.clearTimeout(timeout);
  }, [showChrome, panelOpen]);

  useEffect(() => {
    if (secondsRemaining === null) return;
    if (secondsRemaining <= 0) {
      if (isPlaying) onTogglePlay();
      setSleepTimer(null);
      setSecondsRemaining(null);
      return;
    }

    const interval = window.setInterval(() => {
      setSecondsRemaining(prev => (prev === null ? null : prev - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [secondsRemaining, isPlaying, onTogglePlay]);

  const revealChrome = () => setShowChrome(true);

  const toggleFavorite = () => {
    const favorites = readJson<string[]>('saved_space_favorites', []);
    const updated = favorites.includes(space.id)
      ? favorites.filter(id => id !== space.id)
      : [...favorites, space.id];
    writeJson('saved_space_favorites', updated);
    setFavorite(updated.includes(space.id));
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const setTimerAction = (minutes: number | null) => {
    setSleepTimer(minutes);
    setSecondsRemaining(minutes === null ? null : minutes * 60);
  };

  const handleNextSong = () => {
    const currentIdx = songs.findIndex(song => song.id === activeSongId);
    const nextSong = songs[(currentIdx + 1 + songs.length) % songs.length];
    onSelectSong(nextSong.id);
  };

  const handlePrevSong = () => {
    const currentIdx = songs.findIndex(song => song.id === activeSongId);
    const prevSong = songs[(currentIdx - 1 + songs.length) % songs.length];
    onSelectSong(prevSong.id);
  };

  return (
    <div
      className="absolute inset-0 bg-black z-40 overflow-hidden flex flex-col focus:outline-none select-none"
      onClick={revealChrome}
    >
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
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
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <img
            src={space.bgImage}
            alt={space.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/45" />
      </div>

      <VisualEffects type="rain" freqData={freqData} />

      <AnimatePresence>
        {showChrome && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="absolute top-0 left-0 right-0 z-30 px-5 pt-8 pb-4 bg-gradient-to-b from-black/60 to-transparent"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black/35 border border-white/10 hover:bg-black/60 text-white transition-all cursor-pointer"
              >
                <LucideIcon name="ChevronLeft" size={20} />
              </button>

              <div className="min-w-0 px-4 text-center">
                <h1 className="text-sm font-bold text-white truncate">{space.title}</h1>
                <p className="text-[10px] text-zinc-300 truncate mt-0.5">{space.tag} · {space.creator}</p>
              </div>

              <button
                type="button"
                onClick={toggleFavorite}
                className={`w-10 h-10 flex items-center justify-center rounded-full bg-black/35 border border-white/10 transition-all cursor-pointer ${favorite ? 'text-red-400' : 'text-white'}`}
              >
                <LucideIcon name="Heart" size={17} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 28 }}
            className="fixed left-0 right-0 bottom-[118px] max-w-md mx-auto z-40 px-4"
            onClick={event => event.stopPropagation()}
          >
            <div className="max-h-[54vh] overflow-hidden rounded-3xl border border-white/10 bg-black/55 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/10">
                <div className="flex items-center gap-1 rounded-full bg-white/5 p-1">
                  {[
                    ['songs', '歌曲', 'ListMusic'],
                    ['ambience', '环境音', 'Sliders'],
                    ['effects', '特效', 'Sparkles'],
                  ].map(([tab, label, icon]) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab as PanelTab)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-colors ${
                        activeTab === tab ? 'bg-white text-black' : 'text-zinc-300 hover:text-white'
                      }`}
                    >
                      <LucideIcon name={icon} size={11} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 text-zinc-300 flex items-center justify-center"
                >
                  <LucideIcon name="ChevronDown" size={16} />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[calc(54vh-54px)] p-4">
                {activeTab === 'songs' && (
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {PLAYLISTS.map(playlist => (
                        <button
                          key={playlist.id}
                          type="button"
                          onClick={() => {
                            setActivePlaylistId(playlist.id);
                            onSelectSong(playlist.songs[0]);
                          }}
                          className={`px-3 py-2 rounded-xl text-left shrink-0 border transition-colors ${
                            activePlaylistId === playlist.id
                              ? 'bg-emerald-400/15 border-emerald-400/30 text-emerald-300'
                              : 'bg-white/5 border-white/10 text-zinc-300'
                          }`}
                        >
                          <div className="text-[11px] font-bold">{playlist.title}</div>
                          <div className="text-[9px] text-zinc-500 mt-0.5">{playlist.tag}</div>
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2">
                      {playlistSongs.map(song => {
                        const current = song.id === activeSongId;
                        return (
                          <button
                            key={song.id}
                            type="button"
                            onClick={() => onSelectSong(song.id)}
                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                              current
                                ? 'bg-emerald-400/10 border-emerald-400/30'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img src={song.coverUrl} alt={song.title} className="w-10 h-10 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                              <div className="min-w-0">
                                <h5 className={`text-xs font-bold truncate ${current ? 'text-emerald-300' : 'text-white'}`}>{song.title}</h5>
                                <p className="text-[10px] text-zinc-500 truncate mt-0.5">{song.artist} · {song.genre}</p>
                              </div>
                            </div>
                            {current && <LucideIcon name={isPlaying ? 'Volume2' : 'Circle'} size={14} className="text-emerald-300 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'ambience' && (
                  <div className="flex flex-col gap-3">
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-zinc-200 font-semibold flex items-center gap-1.5">
                          <LucideIcon name="Music" className="text-emerald-300" size={12} />
                          主音乐
                        </span>
                        <span className="text-emerald-300 text-[10px] font-mono">{songVolume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={songVolume}
                        onChange={event => onSetSongVolume(parseInt(event.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg cursor-pointer appearance-none accent-emerald-400"
                      />
                    </div>

                    {ambientSounds.map(sound => (
                      <div
                        key={sound.id}
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                          sound.isPlaying ? 'bg-white/8 border-white/15' : 'bg-white/5 border-white/10 opacity-60'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => onToggleAmbientSound(sound.id)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            sound.isPlaying ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30' : 'bg-zinc-900 text-zinc-500 border border-white/10'
                          }`}
                        >
                          <LucideIcon name={sound.icon} size={15} />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-[11px] mb-1.5">
                            <span className="font-semibold text-white">{sound.name}</span>
                            <span className="text-zinc-500 font-mono">{sound.volume}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={sound.volume}
                            disabled={!sound.isPlaying}
                            onChange={event => onSetAmbientVolume(sound.id, parseInt(event.target.value))}
                            className="w-full h-[3px] bg-zinc-800 rounded-lg appearance-none cursor-pointer disabled:opacity-25 accent-emerald-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'effects' && (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      {['雨滴', '雾气', '粒子', '音乐响应'].map((label, index) => (
                        <button
                          key={label}
                          type="button"
                          className={`p-3 rounded-2xl border text-left ${
                            index === 0 || index === 3 ? 'bg-emerald-400/10 border-emerald-400/25 text-emerald-200' : 'bg-white/5 border-white/10 text-zinc-400'
                          }`}
                        >
                          <div className="text-xs font-bold">{label}</div>
                          <div className="text-[9px] mt-1 opacity-70">{index === 0 || index === 3 ? '已开启' : '待接入'}</div>
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (sleepTimer === null) setTimerAction(15);
                        else if (sleepTimer === 15) setTimerAction(30);
                        else if (sleepTimer === 30) setTimerAction(60);
                        else setTimerAction(null);
                      }}
                      className={`flex items-center justify-between p-3 rounded-2xl border ${
                        sleepTimer ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30' : 'bg-white/5 text-zinc-300 border-white/10'
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-2">
                        <LucideIcon name="Clock" size={13} />
                        睡眠定时
                      </span>
                      <span className="text-[10px] font-mono">{sleepTimer ? formatTime(secondsRemaining || 0) : '关闭'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 px-4 pb-5 pt-6 bg-gradient-to-t from-black via-black/85 to-transparent"
        onClick={event => event.stopPropagation()}
      >
        {!panelOpen && activeAmbients.length > 0 && (
          <div className="mb-2 flex gap-1.5 overflow-x-auto">
            {activeAmbients.slice(0, 4).map(sound => (
              <button
                key={sound.id}
                type="button"
                onClick={() => {
                  setActiveTab('ambience');
                  setPanelOpen(true);
                }}
                className="px-2.5 py-1 rounded-full bg-black/45 border border-white/10 text-[9px] text-zinc-300 flex items-center gap-1 shrink-0"
              >
                <LucideIcon name={sound.icon} size={10} />
                {sound.name}
              </button>
            ))}
          </div>
        )}

        <div className="rounded-3xl bg-zinc-950/85 border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setPanelOpen(prev => !prev)}
            className="w-full h-7 flex items-center justify-center text-zinc-500 hover:text-zinc-200"
            title={panelOpen ? '收起控制面板' : '展开控制面板'}
          >
            <LucideIcon name={panelOpen ? 'ChevronDown' : 'ChevronUp'} size={16} />
          </button>

          <div className="px-4 pb-3">
            <div className="h-8 mb-2 overflow-hidden">
              <VisualBeat isPlaying={isPlaying} freqData={freqData} colorTheme="ocean" compact />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <motion.div
                  animate={isPlaying ? { rotate: 360 } : {}}
                  transition={isPlaying ? { repeat: Infinity, duration: 15, ease: 'linear' } : {}}
                  className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/10 shadow-[0_0_8px_rgba(16,185,129,0.25)]"
                >
                  <img src={activeSong.coverUrl} alt={activeSong.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </motion.div>
                <div className="text-left min-w-0">
                  <h2 className="font-bold text-sm text-white truncate leading-tight">{activeSong.title}</h2>
                  <p className="text-[10px] text-zinc-500 font-semibold mt-1 truncate">{activeSong.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handlePrevSong}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white active:scale-95 transition-all"
                  title="上一首"
                >
                  <LucideIcon name="SkipBack" size={15} />
                </button>
                <button
                  type="button"
                  onClick={onTogglePlay}
                  className="w-11 h-11 rounded-full flex items-center justify-center bg-white text-black hover:bg-zinc-200 active:scale-95 transition-all"
                  title="播放/暂停"
                >
                  <LucideIcon name={isPlaying ? 'Pause' : 'Play'} size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleNextSong}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white active:scale-95 transition-all"
                  title="下一首"
                >
                  <LucideIcon name="SkipForward" size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
