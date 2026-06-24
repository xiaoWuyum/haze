/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface VisualBeatProps {
  isPlaying: boolean;
  freqData: number[]; // real-time frequencies (0 - 255)
  colorTheme?: 'cyber' | 'warm' | 'cosmic' | 'ocean' | 'mv';
  compact?: boolean;
}

export const VisualBeat: React.FC<VisualBeatProps> = ({ isPlaying, freqData, colorTheme = 'cyber', compact = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Fallback procedural visual data if no music running
  const mockFreqs = Array.from({ length: 32 }, (_, i) => {
    const time = Date.now() * 0.003;
    const base = Math.sin(time + i * 0.3) * 35 + 45;
    const jitter = Math.cos(time * 2.1 + i * 0.7) * 15;
    return isPlaying ? Math.max(0, base + jitter) : 8;
  });

  const getThemeColors = () => {
    switch (colorTheme) {
      case 'cyber':
        return {
          barBg: 'bg-cyan-400 shadow-cyan-500/50',
          gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
          text: 'text-cyan-400'
        };
      case 'warm':
        return {
          barBg: 'bg-amber-500 shadow-amber-500/50',
          gradient: 'from-amber-400 via-orange-500 to-red-500',
          text: 'text-amber-400'
        };
      case 'cosmic':
        return {
          barBg: 'bg-purple-500 shadow-purple-500/50',
          gradient: 'from-fuchsia-500 via-purple-600 to-violet-800',
          text: 'text-purple-400'
        };
      case 'ocean':
        return {
          barBg: 'bg-emerald-400 shadow-emerald-500/50',
          gradient: 'from-teal-400 via-emerald-500 to-cyan-500',
          text: 'text-emerald-400'
        };
      case 'mv':
        return {
          barBg: 'bg-rose-500 shadow-rose-500/50',
          gradient: 'from-pink-500 via-red-500 to-yellow-500',
          text: 'text-rose-400'
        };
      default:
        return {
          barBg: 'bg-emerald-400 shadow-green-500/40',
          gradient: 'from-emerald-400 to-green-600',
          text: 'text-green-400'
        };
    }
  };

  const colors = getThemeColors();

  // Active bar array
  const activeBars = freqData && freqData.length > 0 ? freqData.slice(0, 32) : mockFreqs;

  return (
    <div ref={containerRef} className={`w-full max-w-none flex items-end justify-center ${compact ? 'gap-[2px] h-8 px-0' : 'gap-[5px] h-32 px-1'} opacity-85`}>
      {activeBars.map((val, idx) => {
        // Normalize val from 0-255 (if analyzer output) or 0-100 (if mock)
        const isRawAnalyzer = freqData && freqData.length > 0;
        const rawPercent = isRawAnalyzer ? val / 255 : val / 100;
        
        // Ensure a minimum height for visual aesthetics
        const scaleHeight = Math.max(0.06, rawPercent) * 100;

        return (
          <div
            key={idx}
            className={`${compact ? 'w-[5px]' : 'w-[15px] md:w-20px]'} rounded-t-full transition-all duration-75 ${colors.barBg} shadow-[0_0_12px_var(--tw-shadow-color)]`}
            style={{
              height: `${scaleHeight}%`,
              opacity: 0.35 + (rawPercent * 0.65),
              background: `linear-gradient(to top, var(--color-gray-900), ${
                colorTheme === 'cyber' ? '#22d3ee' :
                colorTheme === 'warm' ? '#f59e0b' :
                colorTheme === 'cosmic' ? '#a855f7' :
                colorTheme === 'ocean' ? '#10b981' : '#f43f5e'
              })`
            }}
          />
        );
      })}
    </div>
  );
};
