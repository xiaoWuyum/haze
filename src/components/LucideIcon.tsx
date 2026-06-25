/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ArrowLeft,
  AudioLines,
  Bug,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Circle,
  Clapperboard,
  Clock,
  CloudRain,
  Compass,
  Disc,
  Eye,
  Flame,
  Focus,
  Heart,
  Home,
  ListMusic,
  Loader2,
  Map,
  Moon,
  Music,
  Orbit,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings,
  Shuffle,
  SkipBack,
  SkipForward,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TriangleAlert,
  User,
  Volume2,
  VolumeX,
  Waves,
  Wind,
  X,
} from 'lucide-react';

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
}

const icons: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  ArrowLeft,
  AudioLines,
  Bug,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Circle,
  Clapperboard,
  Clock,
  CloudRain,
  Compass,
  Disc,
  Eye,
  Flame,
  Focus,
  Heart,
  Home,
  ListMusic,
  Loader2,
  Map,
  Moon,
  Music,
  Orbit,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings,
  Shuffle,
  SkipBack,
  SkipForward,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TriangleAlert,
  User,
  Volume2,
  VolumeX,
  Waves,
  Wind,
  X,
};

export const LucideIcon: React.FC<LucideIconProps> = ({ name, className = '', size = 20 }) => {
  const Icon = icons[name] ?? Music;
  return <Icon className={className} size={size} />;
};
