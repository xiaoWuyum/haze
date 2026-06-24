import React, { useRef } from 'react';

interface MagicBentoProps {
  children: React.ReactNode;
  className?: string;
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  glowColor?: string;
  disableAnimations?: boolean;
}

const createParticles = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: index,
    left: `${8 + Math.random() * 84}%`,
    top: `${8 + Math.random() * 84}%`,
    delay: `${Math.random() * 2.4}s`,
    size: `${1 + Math.random() * 2}px`,
  }));

const MagicBento: React.FC<MagicBentoProps> = ({
  children,
  className = '',
  textAutoHide = false,
  enableStars = false,
  enableSpotlight = false,
  enableBorderGlow = true,
  enableTilt = false,
  enableMagnetism = false,
  clickEffect = false,
  spotlightRadius = 400,
  particleCount = 12,
  glowColor = '132, 0, 255',
  disableAnimations = false,
}) => {
  const particlesRef = useRef(createParticles(particleCount));

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((!enableSpotlight && !enableTilt && !enableMagnetism) || disableAnimations) return;

    const cards = event.currentTarget.querySelectorAll<HTMLElement>('.magic-bento-item');

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
      const strength = Math.max(0, 1 - distance / spotlightRadius);

      card.style.setProperty('--magic-x', `${x}px`);
      card.style.setProperty('--magic-y', `${y}px`);
      card.style.setProperty('--magic-border-alpha', strength.toFixed(3));

      if (enableTilt && strength > 0) {
        const rotateX = ((y / rect.height) - 0.5) * -5 * strength;
        const rotateY = ((x / rect.width) - 0.5) * 5 * strength;
        card.style.setProperty('--magic-tilt', `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
      }
    });
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.querySelectorAll<HTMLElement>('.magic-bento-item').forEach((card) => {
      card.style.setProperty('--magic-border-alpha', '0');
      card.style.setProperty('--magic-tilt', 'perspective(800px) rotateX(0deg) rotateY(0deg)');
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!clickEffect || disableAnimations) return;

    const card = (event.target as HTMLElement).closest<HTMLElement>('.magic-bento-item');
    if (!card) return;

    card.classList.remove('magic-bento-clicked');
    void card.offsetWidth;
    card.classList.add('magic-bento-clicked');
  };

  return (
    <div
      className={`magic-bento ${className}`}
      data-text-auto-hide={textAutoHide}
      data-stars={enableStars}
      data-spotlight={enableSpotlight}
      data-border-glow={enableBorderGlow}
      data-disable-animations={disableAnimations}
      style={{
        '--magic-glow-color': glowColor,
        '--magic-spotlight-radius': `${spotlightRadius}px`,
      } as React.CSSProperties}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
    >
      {React.Children.map(children, (child) => (
        <div className="magic-bento-item">
          {enableStars && !disableAnimations && (
            <div className="magic-bento-stars" aria-hidden="true">
              {particlesRef.current.map((particle) => (
                <span
                  key={particle.id}
                  style={{
                    left: particle.left,
                    top: particle.top,
                    width: particle.size,
                    height: particle.size,
                    animationDelay: particle.delay,
                  }}
                />
              ))}
            </div>
          )}
          {child}
        </div>
      ))}
    </div>
  );
};

export default MagicBento;
