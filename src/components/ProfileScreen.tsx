/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Space, Song, HistoryRecord, UserStats } from '../types';
import { LucideIcon } from './LucideIcon';
import { motion } from 'motion/react';
import { readJson, readNumber, writeJson } from '../utils/storage';
import meAvatarUrl from '../picture/me.jpeg';

interface ProfileScreenProps {
  spaces: Space[];
  songs: Song[];
  userEmail?: string;
  onSelectSpace: (space: Space) => void;
  onClearHistory: () => void;
  onDeleteCustomSpace: (spaceId: string) => void;
  onResetApp: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  spaces,
  songs,
  userEmail = 'yuxing1018@gmail.com',
  onSelectSpace,
  onClearHistory,
  onDeleteCustomSpace,
  onResetApp,
}) => {
  const [favorites, setFavorites] = useState<Space[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [stats, setStats] = useState<UserStats>({ listeningMinutes: 44, exploredSpacesCount: 4, createdSpacesCount: 0 });

  // Load state from localStorage on load
  useEffect(() => {
    // 1. Favorites
    const faveIds = readJson<string[]>('saved_space_favorites', []);
    const matchingFaves = spaces.filter(s => faveIds.includes(s.id));
    setFavorites(matchingFaves);

    // 2. Play History
    const storedHistory = readJson<HistoryRecord[]>('saved_play_history', []);
    setHistory(storedHistory.reverse().slice(0, 10)); // reverse for latest first, limit 10

    // 3. Stats calculation
    const listeningSecs = readNumber('user_listening_seconds', 0);
    const listeningMins = Math.max(44, Math.floor(listeningSecs / 60)); // fallback minimum test minutes
    
    const userSpacesCount = spaces.filter(s => 
      s.id.startsWith('custom_') || 
      s.id.startsWith('world_') || 
      s.id.startsWith('cinematic_')
    ).length;

    setStats({
      listeningMinutes: listeningMins,
      exploredSpacesCount: new Set([ ...storedHistory.map(h => h.spaceId), 'cyberpunk_apartment', 'kyoto_house', 'cosmic_drift', 'seaside_cottage' ]).size,
      createdSpacesCount: userSpacesCount
    });
  }, [spaces]);

  const renderMediaCover = (url: string, title: string, className: string) => {
    const isVideo = url.toLowerCase().includes('.mp4') || url.includes('video');
    
    if (isVideo) {
      return (
        <video
          src={url}
          className={`${className} brightness-[0.75]`}
          muted
          playsInline
          onLoadedData={(e) => {
            e.currentTarget.currentTime = 0.001;
          }}
        />
      );
    }
    
    return (
      <img
        src={url}
        alt={title}
        className={className}
        referrerPolicy="no-referrer"
      />
    );
  };

  const handleRemoveFavorite = (e: React.MouseEvent, spaceId: string) => {
    e.stopPropagation();
    const faveIds = readJson<string[]>('saved_space_favorites', []);
    const updated = faveIds.filter(id => id !== spaceId);
    writeJson('saved_space_favorites', updated);
    setFavorites(prev => prev.filter(s => s.id !== spaceId));
  };

  const formatPlayedAt = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      // Format to YY/MM/DD HH:MM
      const yr = d.getFullYear().toString().slice(-2);
      const mo = (d.getMonth() + 1).toString().padStart(2, '0');
      const dy = d.getDate().toString().padStart(2, '0');
      const hr = d.getHours().toString().padStart(2, '0');
      const mn = d.getMinutes().toString().padStart(2, '0');
      return `${yr}/${mo}/${dy} ${hr}:${mn}`;
    } catch (e) {
      return "刚刚";
    }
  };

  const customCreatedSpaces = spaces.filter(s => 
    s.id.startsWith('custom_') || 
    s.id.startsWith('world_') || 
    s.id.startsWith('cinematic_')
  );

  return (
    <div className="w-full px-6 pt-8 pb-44 max-w-md mx-auto flex flex-col gap-6">
      
      {/* 1. Profile card layout */}
      <div className="flex items-center gap-4 bg-zinc-900/40 p-5 rounded-2xl border border-white/5 backdrop-blur-md">
        <div className="w-16 h-16 rounded-full border border-white/10 shadow-lg overflow-hidden shrink-0 bg-zinc-900">
          <img
            src={meAvatarUrl}
            alt="我的头像"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="truncate">
          <h2 className="text-base font-bold text-white tracking-wide">yuxing1018</h2>
          <p className="text-[11px] font-mono text-zinc-500 mt-1 truncate">{userEmail}</p>
          <span className="inline-block mt-2 px-2 py-0.5 text-[9px] font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/20 rounded-md">
            觅镜·Haze Premium
          </span>
        </div>
      </div>

      {/* 2. Numeric Statistics dashboard row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-3.5 text-center">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">听歌时长</span>
          <span className="text-lg font-bold text-white mt-1.5 block font-mono">
            {stats.listeningMinutes} <span className="text-xs text-zinc-400 font-sans font-normal">分</span>
          </span>
        </div>

        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-3.5 text-center">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">已探索</span>
          <span className="text-lg font-bold text-white mt-1.5 block font-mono">
            {stats.exploredSpacesCount} <span className="text-xs text-zinc-400 font-sans font-normal">个</span>
          </span>
        </div>

        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-3.5 text-center">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">自建空间</span>
          <span className="text-lg font-bold text-white mt-1.5 block font-mono">
            {stats.createdSpacesCount} <span className="text-xs text-zinc-400 font-sans font-normal">个</span>
          </span>
        </div>
      </div>

      {/* 3. Favorite Spaces section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <LucideIcon name="Heart" size={14} className="text-red-500" />
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-zinc-400">我的收藏空间</h3>
        </div>

        {favorites.length > 0 ? (
          <div className="flex flex-col gap-2">
            {favorites.map(space => (
              <div
                key={space.id}
                onClick={() => onSelectSpace(space)}
                className="group flex items-center justify-between p-2.5 bg-zinc-900/20 hover:bg-zinc-900/50 rounded-xl border border-white/5 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    {renderMediaCover(space.bgImage, space.title, "w-full h-full object-cover")}
                  </div>
                  <div className="truncate text-left">
                    <h4 className="font-semibold text-white text-xs leading-none">{space.title}</h4>
                    <span className="text-[10px] text-zinc-500 mt-1 block font-mono">{space.tag ? `${space.creator} · ${space.tag}` : space.creator}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleRemoveFavorite(e, space.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <LucideIcon name="Trash2" size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 border border-dashed border-white/5 rounded-2xl text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
            <LucideIcon name="Heart" size={16} className="text-zinc-700" />
            <span>暂无收藏的空间，去广场里逛逛吧</span>
          </div>
        )}
      </div>

      {/* 4. Created custom spaces list manager */}
      {customCreatedSpaces.length > 0 && (
        <div>
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-zinc-400 mb-3 block">我创建的氛围场景</h3>
          <div className="flex flex-col gap-2">
            {customCreatedSpaces.map(space => (
              <div 
                key={space.id}
                onClick={() => onSelectSpace(space)}
                className="flex items-center justify-between p-2.5 bg-zinc-900/35 hover:bg-zinc-900/60 rounded-xl border border-white/5 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    {renderMediaCover(space.bgImage, space.title, "w-full h-full object-cover")}
                  </div>
                  <div className="truncate text-left">
                    <h5 className="font-semibold text-white text-xs">{space.title}</h5>
                    {space.tag && (
                      <span className="text-[9px] px-1.5 py-0.5 mt-1 inline-block border border-cyan-500/20 text-cyan-400 bg-cyan-950/60 rounded-md font-bold">{space.tag}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCustomSpace(space.id);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <LucideIcon name="Trash2" size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Playback History records */}
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-1">
          <div className="flex items-center gap-2">
            <LucideIcon name="Clock" size={13} className="text-zinc-400" />
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-zinc-400">历史足迹</h3>
          </div>
          {history.length > 0 && (
            <button 
              onClick={onClearHistory}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 font-semibold cursor-pointer"
            >
              清空
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
            {history.map(record => (
              <div 
                key={record.id}
                className="flex gap-3 justify-between items-start p-2 rounded-xl bg-zinc-900/10 border border-white/5 hover:border-white/10 text-xs"
              >
                <div className="truncate text-left">
                  <span className="font-bold text-white text-xs block truncate">{record.spaceTitle}</span>
                  <span className="text-[10px] text-zinc-500 mt-1 block truncate">
                    和弦: <span className="text-zinc-400">{record.songTitle}</span>
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[9px] text-zinc-500 block font-mono font-medium">{formatPlayedAt(record.playedAt)}</span>
                  <span className="text-[9px] text-emerald-400/80 bg-emerald-950/30 px-1 py-0.5 rounded border border-emerald-500/10 mt-1 inline-block">探索成功</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 border border-dashed border-white/5 rounded-2xl text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
            <span>暂无历史探索脚印</span>
          </div>
        )}
      </div>
    </div>
  );
};
