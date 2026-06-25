/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';

import frontVideoUrl from '../assets/video/front.mp4';
import background2Url from '../picture/background2.jpg';
import mp3Url from '../picture/mp3.png';
import tvUrl from '../picture/tv.png';
import GradientShader from './GradientShader';


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
  const [showGradientShader, setShowGradientShader] = useState(false);

  const handleOpenPlaza = () => {
    setShowGradientShader(true);
    setTimeout(() => {
      setShowGradientShader(false);
      onOpenPlaza();
    }, 1000);
  };

  const handleOpenPlay = () => {
    setShowGradientShader(true);
    setTimeout(() => {
      setShowGradientShader(false);
      onOpenPlay();
    }, 1000);
  };
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
        <p className="mt-3 text-sm sm:text-base text-white/80 tracking-[0.3em] " style={{ fontFamily: "'HYPixel', monospace", textShadow: '2px 2px 0px #000' }}>
          在某个频率里，等你
        </p>
      </motion.div>

      <motion.button
        type="button"
        onClick={handleOpenPlaza}
        whileTap={{ scale: 1.15 }}
        className="home-tv"
        aria-label="进入广场"
      >
        <motion.img
          src={tvUrl}
          alt=""
          aria-hidden="true"
          className="home-float home-float-1 home-tv-img drop-shadow-[0_0_30px_rgba(255,255,255,0.9)]"
        />
      </motion.button>

      <motion.button
        type="button"
        onClick={handleOpenPlay}
        whileTap={{ scale: 1.15 }}
        className="home-mp3"
        aria-label="进入播放列表"
      >
        <motion.img
          src={mp3Url}
          alt=""
          aria-hidden="true"
          className="home-float home-float-2 home-mp3-img drop-shadow-[0_0_30px_rgba(255,255,255,0.9)]"
        />
      </motion.button>

      {showGradientShader && (
        <div className="absolute inset-0 z-50">
          <GradientShader text="正在感知这首歌的空间…" />
        </div>
      )}
    </div>
  );
};
