/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  volume: number; // 0 - 100
  isPlaying: boolean;
  synthType: 'rain' | 'waves' | 'fire' | 'crickets' | 'space' | 'wind' | 'vinyl';
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  genre: string;
  notes: string;
  duration: number; // in seconds
  audioUrl?: string; // Optional local MP3 file served from public/audio
  notesSequence?: string[]; // Synthesized notes for player
}

export interface Space {
  id: string;
  title: string;
  tag: string;
  creator: string;
  creatorAvatar?: string;
  bgImage: string;
  ambientSounds: { soundId: string; volume: number }[];
  defaultSongId: string;
  description?: string;
  type?: 'space' | 'mv';
  videoUrl?: string; // or dynamic visualizer code/style
}

export interface HistoryRecord {
  id: string;
  spaceId: string;
  spaceTitle: string;
  songTitle: string;
  songArtist: string;
  playedAt: string; // ISO String
  duration: number; // listening time in seconds
}

export interface UserStats {
  listeningMinutes: number;
  exploredSpacesCount: number;
  createdSpacesCount: number;
}
