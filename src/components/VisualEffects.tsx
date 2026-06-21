/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface VisualEffectsProps {
  type: 'rain' | 'leaves' | 'stars' | 'waves';
  intensity?: number; // 0 - 100
  freqData?: number[]; // Audio frequencies (0 - 255)
}

export const VisualEffects: React.FC<VisualEffectsProps> = ({ type, intensity = 50, freqData = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Audio frequency driver indicators
    const getBassPower = () => {
      if (!freqData || freqData.length === 0) return 0.5;
      // Average the lowest 5 frequency bins for bass punch
      const lowFreqs = freqData.slice(0, 6);
      const avg = lowFreqs.reduce((sum, val) => sum + val, 0) / lowFreqs.length;
      return avg / 255; // 0 to 1
    };

    const getTreblePower = () => {
      if (!freqData || freqData.length === 0) return 0.5;
      // Average higher bins for sparkles/rain speed
      const highFreqs = freqData.slice(12, 24);
      if (highFreqs.length === 0) return 0.5;
      const avg = highFreqs.reduce((sum, val) => sum + val, 0) / highFreqs.length;
      return avg / 255;
    };

    // 1. RAINDROP PARTICLES
    interface RainDrop {
      x: number;
      y: number;
      vy: number;
      length: number;
      alpha: number;
    }
    const rainDrops: RainDrop[] = [];
    const maxRainDrops = Math.floor((width * height) / 8000) * (intensity / 50);
    
    // Splashes for rain glass
    interface Splash {
      x: number;
      y: number;
      r: number;
      maxR: number;
      alpha: number;
    }
    const splashes: Splash[] = [];

    // Initialize rain drops
    for (let i = 0; i < maxRainDrops; i++) {
      rainDrops.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        vy: 4 + Math.random() * 8,
        length: 15 + Math.random() * 20,
        alpha: 0.15 + Math.random() * 0.35,
      });
    }

    // 2. FALLING CHERRY LEAVES/PETALS
    interface Petal {
      x: number;
      y: number;
      vy: number;
      vx: number;
      angle: number;
      size: number;
      spinSpeed: number;
    }
    const petals: Petal[] = [];
    const maxPetals = 25 * (intensity / 50);
    for (let i = 0; i < maxPetals; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        vy: 1 + Math.random() * 2,
        vx: 0.5 - Math.random() * 1.5,
        angle: Math.random() * Math.PI * 2,
        size: 6 + Math.random() * 8,
        spinSpeed: 0.01 + Math.random() * 0.02,
      });
    }

    // 3. COSMIC STARFIELD
    interface Star {
      x: number;
      y: number;
      z: number;
      color: string;
    }
    const stars: Star[] = [];
    const maxStars = 150;
    for (let i = 0; i < maxStars; i++) {
      stars.push({
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * width,
        color: `hsl(${180 + Math.random() * 90}, 80%, 80%)`,
      });
    }

    // 4. WATER RIPPLE SHORES
    let ripplePhase = 0;

    // ANIMATION RENDER LOOP
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const bass = getBassPower();
      const treble = getTreblePower();

      switch (type) {
        case 'rain': {
          // Draw falling rain lines on glass window prism
          ctx.strokeStyle = `rgba(156, 163, 175, 0.4)`;
          ctx.lineWidth = 1;

          rainDrops.forEach((d) => {
            // Accelerate based on high-freq treble
            const currentVy = d.vy * (1 + treble * 0.8);
            d.y += currentVy;
            d.x += 0.5 * (1 + treble); // slight rain slant

            if (d.y > height) {
              d.y = -10;
              d.x = Math.random() * width;
              // trigger glass splash
              splashes.push({
                x: d.x,
                y: height * 0.9 + Math.random() * height * 0.1, // accumulate splash near bottom
                r: 1,
                maxR: 5 + Math.random() * 10,
                alpha: 0.6,
              });
            }

            // Draw droplet
            ctx.beginPath();
            ctx.strokeStyle = `rgba(165, 243, 252, ${d.alpha * (0.8 + treble * 0.4)})`;
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x + 0.5 * (1 + treble), d.y + d.length * (1 + treble * 0.5));
            ctx.stroke();
          });

          // Draw and animate splashes on the glass window
          splashes.forEach((s, idx) => {
            s.r += 0.4;
            s.alpha -= 0.015;

            ctx.beginPath();
            ctx.strokeStyle = `rgba(207, 250, 254, ${s.alpha})`;
            ctx.ellipse(s.x, s.y, s.r, s.r * 0.3, 0, 0, Math.PI * 2);
            ctx.stroke();

            if (s.alpha <= 0) {
              splashes.splice(idx, 1);
            }
          });
          break;
        }

        case 'leaves': {
          // Draw falling warm orange autumn leaves / cherry petals
          petals.forEach((p) => {
            // Bass swells push the leaves outwards or speed up fall
            const windPush = bass * 2.2;
            p.y += p.vy * (1 + bass * 0.6);
            p.x += (p.vx + windPush) * 0.8;
            p.angle += p.spinSpeed * (1 + treble * 1.5);

            if (p.y > height || p.x > width + 20) {
              p.y = -20;
              p.x = Math.random() * width - 40;
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            
            // Draw stylized orange leaf/cherry petal
            const gradient = ctx.createLinearGradient(0, 0, p.size, p.size);
            gradient.addColorStop(0, `rgba(249, 115, 22, ${0.45 + bass * 0.25})`); // warm orange
            gradient.addColorStop(1, `rgba(239, 68, 68, ${0.45 + bass * 0.25})`);  // soft autumn red
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(p.size, -p.size * 0.3, p.size, p.size * 0.2);
            ctx.quadraticCurveTo(p.size * 0.3, p.size, 0, 0);
            ctx.fill();
            ctx.restore();
          });
          break;
        }

        case 'stars': {
          // Draw Hyperspace Cosmic Starfield
          // Stars fly from center
          const cx = width / 2;
          const cy = height / 2;

          stars.forEach((s) => {
            // Speed up based on bass power
            const speed = 2.0 * (1.2 + bass * 4.4);
            s.z -= speed;

            if (s.z <= 0) {
              s.z = width;
              s.x = Math.random() * width - cx;
              s.y = Math.random() * height - cy;
            }

            const k = 128.0 / s.z;
            const px = s.x * k + cx;
            const py = s.y * k + cy;

            if (px >= 0 && px <= width && py >= 0 && py <= height) {
              const r = (1 - s.z / width) * 4.5 * (1 + bass * 1.2);
              const alpha = (1 - s.z / width) * (0.6 + bass * 0.4);

              ctx.fillStyle = s.color;
              ctx.shadowBlur = r * 2;
              ctx.shadowColor = `rgba(168, 85, 247, 0.8)`; // purple galactic aura

              ctx.beginPath();
              ctx.arc(px, py, r, 0, Math.PI * 2);
              ctx.fill();
            }
          });
          // Reset shadow config
          ctx.shadowBlur = 0;
          break;
        }

        case 'waves': {
          // Shore wave lines under sunlight + shadow swaying palm leaves
          ripplePhase += 0.015 * (1 + bass * 0.8);
          ctx.lineWidth = 1.5;

          // Draw beach tides (flowing water ripples on bottom half of the screen)
          const rippleCount = 3;
          for (let i = 0; i < rippleCount; i++) {
            const level = height * 0.65 + i * 45;
            const waveAmp = 10 + bass * 30; // swell amp driven by bass
            const waveFreq = 0.003 + i * 0.001;

            ctx.beginPath();
            ctx.strokeStyle = `rgba(103, 232, 249, ${0.15 - i * 0.03 + bass * 0.1})`;
            
            ctx.moveTo(0, level);
            for (let x = 0; x <= width; x += 30) {
              const y = level + Math.sin(x * waveFreq + ripplePhase + i) * waveAmp;
              ctx.lineTo(x, y);
            }
            ctx.stroke();
          }

          // Swaying Palm shadow overlay (gorgeous minimal beach atmosphere)
          ctx.save();
          ctx.fillStyle = 'rgba(15, 23, 42, 0.06)'; // very light gray shadow
          const swayAngle = Math.sin(ripplePhase * 0.5) * 0.08;
          ctx.translate(width + 50, -100);
          ctx.rotate(swayAngle + Math.PI * 0.3); // angle downwards
          
          // Draw a stylized palm branch
          ctx.beginPath();
          ctx.rect(0, -10, -width * 0.5, 20); // main stem
          ctx.fill();
          
          // leaflets
          const leaflets = 18;
          for (let i = 0; i < leaflets; i++) {
            const lx = -40 - i * 18;
            ctx.beginPath();
            ctx.ellipse(lx, 20, 10, 80, 0.2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
          break;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [type, intensity, freqData]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-70 z-10"
    />
  );
};
