/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

import background2Url from '../picture/background2.png';
import heart2Url from '../picture/heart2.png';
import mp3Url from '../picture/mp3.png';
import screenUrl from '../picture/screen.png';
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
      <img
        src={background2Url}
        alt=""
        aria-hidden="true"
        className="home-background"
      />

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

      <motion.img
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
      </motion.button>
    </div>
  );
};
