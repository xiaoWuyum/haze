/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  CloudRain, 
  Waves, 
  Flame, 
  Bug, 
  Sparkles, 
  Wind, 
  Disc, 
  Music,
  Play,
  Pause,
  Plus,
  Compass,
  User,
  Search,
  Volume2,
  VolumeX,
  Heart,
  ArrowLeft,
  Clock,
  Trash2,
  Check,
  Eye,
  Settings,
  SkipBack,
  SkipForward
} from 'lucide-react';

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const LucideIcon: React.FC<LucideIconProps> = ({ name, className = '', size = 20 }) => {
  switch (name) {
    case 'CloudRain':
      return <CloudRain className={className} size={size} />;
    case 'Waves':
      return <Waves className={className} size={size} />;
    case 'Flame':
      return <Flame className={className} size={size} />;
    case 'Bug':
      return <Bug className={className} size={size} />;
    case 'Sparkles':
      return <Sparkles className={className} size={size} />;
    case 'Wind':
      return <Wind className={className} size={size} />;
    case 'Disc':
      return <Disc className={className} size={size} />;
    case 'Music':
      return <Music className={className} size={size} />;
    case 'Play':
      return <Play className={className} size={size} />;
    case 'Pause':
      return <Pause className={className} size={size} />;
    case 'Plus':
      return <Plus className={className} size={size} />;
    case 'Compass':
      return <Compass className={className} size={size} />;
    case 'User':
      return <User className={className} size={size} />;
    case 'Search':
      return <Search className={className} size={size} />;
    case 'Volume2':
      return <Volume2 className={className} size={size} />;
    case 'VolumeX':
      return <VolumeX className={className} size={size} />;
    case 'Heart':
      return <Heart className={className} size={size} />;
    case 'ArrowLeft':
      return <ArrowLeft className={className} size={size} />;
    case 'Clock':
      return <Clock className={className} size={size} />;
    case 'Trash2':
      return <Trash2 className={className} size={size} />;
    case 'Check':
      return <Check className={className} size={size} />;
    case 'Eye':
      return <Eye className={className} size={size} />;
    case 'Settings':
      return <Settings className={className} size={size} />;
    case 'SkipBack':
      return <SkipBack className={className} size={size} />;
    case 'SkipForward':
      return <SkipForward className={className} size={size} />;
    default:
      return <Music className={className} size={size} />;
  }
};
