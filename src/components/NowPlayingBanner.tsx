import React from 'react';
import { motion } from 'motion/react';
import type { Song } from '../types';
import { LucideIcon } from './LucideIcon';

interface NowPlayingBannerProps {
  song: Song;
  isPlaying: boolean;
  onOpenPlayer: () => void;
  onTogglePlay: () => void;
  onNextSong: () => void;
}

export const NowPlayingBanner: React.FC<NowPlayingBannerProps> = ({
  song,
  isPlaying,
  onOpenPlayer,
  onTogglePlay,
  onNextSong,
}) => {
  return (
    <div className="fixed bottom-[86px] left-0 right-0 max-w-md mx-auto z-40 px-5">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.99 }}
        onClick={onOpenPlayer}
        className="flex items-center justify-between p-3 bg-transparent backdrop-blur-sm border border-white/20 rounded-2xl shadow-[0_18px_38px_rgba(0,0,0,0.18)] cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-11 h-11 rounded-full flex items-center justify-center bg-transparent overflow-hidden shadow-md border border-white/15 shrink-0">
            <motion.img
              src={song.coverUrl}
              alt={song.title}
              animate={isPlaying ? { rotate: 360 } : {}}
              transition={isPlaying ? { repeat: Infinity, duration: 9, ease: 'linear' } : {}}
              className="w-10 h-10 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute w-3 h-3 rounded-full bg-black/75 border-2 border-white/10 inset-0 m-auto" />
          </div>
          <div className="min-w-0 text-left">
            <h4 className="font-semibold text-white text-[13px] leading-tight truncate flex items-center gap-1.5">
              {song.title}
              {isPlaying && (
                <span className="flex items-center gap-[2px] h-2.5 w-3.5 shrink-0">
                  <span className="w-[1.5px] h-full bg-cyan-400 animate-bounce" />
                  <span className="w-[1.5px] h-2 bg-cyan-400 animate-bounce" style={{ animationDelay: '120ms' }} />
                  <span className="w-[1.5px] h-full bg-cyan-400 animate-bounce" style={{ animationDelay: '240ms' }} />
                </span>
              )}
            </h4>
            <p className="text-[10px] text-zinc-400 mt-1 truncate">{song.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            onClick={onTogglePlay}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-transparent hover:bg-white/10 border border-white/15 text-white active:scale-95 transition-all"
            title={isPlaying ? '暂停' : '继续播放'}
          >
            <LucideIcon name={isPlaying ? 'Pause' : 'Play'} size={15} />
          </button>
          <button
            type="button"
            onClick={onNextSong}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-transparent hover:bg-white/10 border border-white/15 text-white active:scale-95 transition-all"
            title="下一首"
          >
            <LucideIcon name="SkipForward" size={15} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
