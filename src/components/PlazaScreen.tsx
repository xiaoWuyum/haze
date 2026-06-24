/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Space } from '../types';
import { LucideIcon } from './LucideIcon';
import { motion, AnimatePresence } from 'motion/react';
import MagicBento from './MagicBento';

interface PlazaScreenProps {
  spaces: Space[];
  mvs: Space[];
  onSelectSpace: (space: Space) => void;
}

const playlistCards = [
  {
    id: 'kpop',
    title: 'KPOP歌单',
    subtitle: 'NewJeans / K-Pop',
    coverUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&auto=format&fit=crop&q=80',
    badge: 'PLAYLIST',
    songIds: ['how_sweet', 'hype_boy', 'supernatural'],
  },
  {
    id: 'mandopop',
    title: '华语歌单',
    subtitle: 'R&B/Mandopop',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80',
    badge: 'PLAYLIST',
    songIds: ['ordinary_friends', 'airport_1030', 'hongdou', 'summer_wind'],
  },
];

export const PlazaScreen: React.FC<PlazaScreenProps> = ({
  spaces,
  mvs,
  onSelectSpace,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  const normalizedQuery = searchQuery.toLowerCase();
  const filteredSpaces = spaces.filter(space =>
    space.title.toLowerCase().includes(normalizedQuery) ||
    space.tag.toLowerCase().includes(normalizedQuery) ||
    space.creator.toLowerCase().includes(normalizedQuery)
  );

  const filteredMvs = mvs.filter(mv =>
    mv.title.toLowerCase().includes(normalizedQuery) ||
    mv.tag.toLowerCase().includes(normalizedQuery)
  );

  const renderSearchResult = (space: Space) => (
    <button
      key={space.id}
      type="button"
      onClick={() => {
        onSelectSpace(space);
        setShowSearchModal(false);
      }}
      className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/50 border border-white/5 cursor-pointer transition-colors text-left"
    >
      <img
        src={space.bgImage}
        alt={space.title}
        className="w-12 h-12 rounded-lg object-cover shrink-0"
        referrerPolicy="no-referrer"
      />
      <div className="min-w-0">
        <h5 className="font-semibold text-white text-sm truncate">{space.title}</h5>
        <span className="text-xs text-zinc-400 truncate block">{space.tag ? `${space.creator} · ${space.tag}` : space.creator}</span>
      </div>
    </button>
  );

  const renderCard = (space: Space, compact = false) => (
    <motion.button
      key={space.id}
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelectSpace(space)}
      className={`group relative ${compact ? 'h-36' : 'h-48'} rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-white/5 bg-zinc-900 transition-all duration-350 hover:border-white/10 text-left`}
    >
      <img
        src={space.bgImage}
        alt={space.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-[0.75]"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
      <div className="absolute top-3 left-3">
        {(compact || space.tag) && (
          <span className="inline-block px-2.5 py-0.5 text-[9px] font-medium rounded-full border text-emerald-300 bg-emerald-950/70 border-emerald-500/20 backdrop-blur-md">
            {compact ? 'MV' : space.tag}
          </span>
        )}
      </div>
      <div className="absolute bottom-3 left-3 right-3">
        <h3 className="font-semibold text-white text-[13px] leading-tight group-hover:text-cyan-300 transition-colors truncate">
          {space.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-400">
          <span className="font-mono truncate">{space.creator}</span>
        </div>
      </div>
    </motion.button>
  );

  const renderPlaylistCard = (playlist: typeof playlistCards[number]) => (
    <motion.button
      key={playlist.id}
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelectSpace({
        id: `playlist_${playlist.id}`,
        title: playlist.title,
        tag: playlist.subtitle,
        creator: '我的歌单',
        bgImage: playlist.coverUrl,
        ambientSounds: [],
        defaultSongId: playlist.songIds[0],
        description: `${playlist.title} · ${playlist.subtitle}`,
        type: 'playlist',
        playlistSongIds: playlist.songIds,
      })}
      className="group relative h-36 rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-white/5 bg-zinc-900 transition-all duration-350 hover:border-white/10 text-left"
    >
      <img
        src={playlist.coverUrl}
        alt={playlist.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-[0.72]"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute top-3 left-3">
        <span className="inline-block px-2.5 py-0.5 text-[9px] font-medium rounded-full border text-fuchsia-200 bg-fuchsia-950/70 border-fuchsia-400/25 backdrop-blur-md">
          {playlist.badge}
        </span>
      </div>
      <div className="absolute bottom-3 left-3 right-3">
        <h3 className="font-semibold text-white text-[13px] leading-tight group-hover:text-fuchsia-200 transition-colors truncate">
          {playlist.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-400">
          <span className="font-mono truncate">{playlist.subtitle}</span>
        </div>
      </div>
    </motion.button>
  );

  return (
    <div className="w-full pb-56">
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
                    onChange={(event) => setSearchQuery(event.target.value)}
                    autoFocus
                    className="bg-transparent text-white border-none outline-none text-base placeholder-zinc-500 w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowSearchModal(false);
                    setSearchQuery('');
                  }}
                  className="text-zinc-500 hover:text-white px-2 py-1 text-sm bg-zinc-800/40 rounded-lg shrink-0"
                >
                  取消
                </button>
              </div>

              <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
                {filteredSpaces.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase mb-2">精选空间</h4>
                    <div className="flex flex-col gap-2">{filteredSpaces.map(renderSearchResult)}</div>
                  </div>
                )}

                {filteredMvs.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase mb-2">MV 影厅</h4>
                    <div className="flex flex-col gap-2">{filteredMvs.map(renderSearchResult)}</div>
                  </div>
                )}

                {filteredSpaces.length === 0 && filteredMvs.length === 0 && (
                  <div className="text-center py-12">
                    <span className="text-sm text-zinc-500">未找到符合条件的空间</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <div>
          <h1 className="text-[28px] font-bold text-white tracking-wide font-sans leading-none">觅境</h1>
          <p className="text-[12px] text-zinc-400 mt-2 tracking-wider">为每首歌，找到它的空间</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="btn_search_launch"
            type="button"
            onClick={() => setShowSearchModal(true)}
            className="w-10 h-10 rounded-full bg-zinc-900/60 border border-white/5 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <LucideIcon name="Search" size={18} />
          </button>
          <div className="w-10 h-10 rounded-full bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center font-bold text-sm text-indigo-300 select-none">
            Sx
          </div>
        </div>
      </div>

      <div id="sec_spotlight" className="px-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white tracking-wide font-sans">精选空间</h2>
          <span className="text-xs text-zinc-500">查看全部</span>
        </div>
        <MagicBento
          className="grid grid-cols-2 gap-4"
          textAutoHide={true}
          enableStars
          enableSpotlight
          enableBorderGlow={true}
          enableTilt={false}
          enableMagnetism={false}
          clickEffect
          spotlightRadius={400}
          particleCount={12}
          glowColor="132, 0, 255"
          disableAnimations={false}
        >
          {spaces.map(space => renderCard(space))}
        </MagicBento>
      </div>

      <div id="sec_mv" className="px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white tracking-wide font-sans">MV 影厅</h2>
          <span className="text-xs text-zinc-500">查看全部</span>
        </div>
        <MagicBento
          className="grid grid-cols-2 gap-4"
          textAutoHide={true}
          enableStars
          enableSpotlight
          enableBorderGlow={true}
          enableTilt={false}
          enableMagnetism={false}
          clickEffect
          spotlightRadius={400}
          particleCount={12}
          glowColor="132, 0, 255"
          disableAnimations={false}
        >
          {mvs.map(mv => renderCard(mv, true))}
        </MagicBento>
      </div>

      <div id="sec_playlists" className="px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white tracking-wide font-sans">我的歌单</h2>
          <span className="text-xs text-zinc-500">查看全部</span>
        </div>
        <MagicBento
          className="grid grid-cols-2 gap-4"
          textAutoHide={true}
          enableStars
          enableSpotlight
          enableBorderGlow={true}
          enableTilt={false}
          enableMagnetism={false}
          clickEffect
          spotlightRadius={400}
          particleCount={12}
          glowColor="132, 0, 255"
          disableAnimations={false}
        >
          {playlistCards.map(renderPlaylistCard)}
        </MagicBento>
      </div>
    </div>
  );
};
