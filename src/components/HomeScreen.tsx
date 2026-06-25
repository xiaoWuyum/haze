/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

import frontVideoUrl from '../assets/video/front.mp4';
import background2Url from '../picture/background2.jpg';
import mp3Url from '../picture/mp3.png';
import tvUrl from '../picture/tv.png';

interface HomeScreenProps {
  onOpenPlaza: () => void;
  onOpenPlay: () => void;
  onOpenCreate: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenPlaza,
  onOpenPlay,
  onOpenCreate,
}: HomeScreenProps) => {
  return (
    <div className="home-screen">
      <video
        src={frontVideoUrl}
        poster={background2Url}
        aria-hidden="true"
        autoPlay
        muted
        loop
        playsInline
        className="home-background"
      />

      {/* 像素风标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute top-[11%] left-0 right-0 z-10 flex flex-col items-center justify-center pointer-events-none"
      >
        <h1 className="text-4xl sm:text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] tracking-wider" style={{ fontFamily: "'HYPixel', monospace", textShadow: '4px 4px 0px #000, -2px -2px 0 #ff6b9d' }}>
          觅镜
        </h1>
        <p className="mt-3 text-sm sm:text-base text-white/80 tracking-[0.3em]" style={{ fontFamily: "'HYPixel', monospace", textShadow: '2px 2px 0px #000' }}>
          在某个频率里，等你
        </p>
      </motion.div>

      <motion.button
        type="button"
        onClick={onOpenPlaza}
        whileTap={{ scale: 0.95 }}
        className="home-tv"
        aria-label="进入广场"
      >
        <motion.img
          src={tvUrl}
          alt=""
          aria-hidden="true"
          className="home-float home-float-1 home-tv-img"
        />
      </motion.button>

      <motion.button
        type="button"
        onClick={onOpenPlay}
        whileTap={{ scale: 0.95 }}
        className="home-mp3"
        aria-label="进入播放列表"
      >
        <motion.img
          src={mp3Url}
          alt=""
          aria-hidden="true"
          className="home-float home-float-2 home-mp3-img"
        />
      </motion.button>

      {/* <motion.img
        src={heart2Url}
        alt=""
        aria-hidden="true"
        className="home-heart home-float home-float-3 home-heart-img"
      />

      <motion.button
        type="button"
        onClick={onOpenCreate}
        className="home-screen-launch"
        aria-label="进入创建"
      >
        <motion.img
          src={screenUrl}
          alt=""
          aria-hidden="true"
          className="home-screen-launch-img"
        />
      </motion.button> */}
    </div>
  );
};
