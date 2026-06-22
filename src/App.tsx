/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Space, Song, AmbientSound, HistoryRecord } from './types';
import { SONGS, AMBIENT_SOUNDS, DEFAULT_SPACES, DEFAULT_MVS } from './data';
import { AudioEngine } from './utils/audioEngine';
import { LucideIcon } from './components/LucideIcon';
import { PlazaScreen } from './components/PlazaScreen';
import { PlayScreen } from './components/PlayScreen';
import { CreateScreen } from './components/CreateScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { motion, AnimatePresence } from 'motion/react';
import { readJson, readNumber, removeStoredValue, writeJson, writeNumber } from './utils/storage';

type TabType = 'plaza' | 'play' | 'create' | 'profile';

export default function App() {
  const [activeTab, setActiveTab ] = useState<TabType>('plaza');
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [mvs] = useState<Space[]>(DEFAULT_MVS);
  
  // Custom states
  const [activeSpace, setActiveSpace] = useState<Space | null>(null);
  const [activeSongId, setActiveSongId] = useState<string>(SONGS[0].id);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [songVolume, setSongVolume] = useState<number>(60);
  const [ambientList, setAmbientList] = useState<AmbientSound[]>(AMBIENT_SOUNDS);
  
  // Analyser frequencies
  const [freqData, setFreqData] = useState<number[]>([]);

  // Load spaces on initialization
  useEffect(() => {
    const custom_spaces = readJson<Space[]>('custom_created_spaces', []);
    setSpaces([...DEFAULT_SPACES, ...custom_spaces]);
    
    // Default active space to High rise apartment
    setActiveSpace(DEFAULT_SPACES[0]);
    setActiveSongId(DEFAULT_SPACES[0].defaultSongId);
    
    // Setup initial ambient sound states for that default space
    syncSpaceAtmosphere(DEFAULT_SPACES[0]);
  }, []);

  // Set visual real-time loop from AudioEngine
  useEffect(() => {
    AudioEngine.onBeatCallback = (step, data) => {
      setFreqData(data);
    };
    return () => {
      AudioEngine.onBeatCallback = null;
    };
  }, []);

  // Listening time stats tracker increments every second when active
  useEffect(() => {
    if (!isPlaying) return;
    const statsInterval = setInterval(() => {
      const current = readNumber('user_listening_seconds', 0);
      writeNumber('user_listening_seconds', current + 1);
    }, 1000);
    return () => clearInterval(statsInterval);
  }, [isPlaying]);

  // Handle atmosphere mixes when a space loads
  const syncSpaceAtmosphere = (space: Space) => {
    // Reset all ambients isPlaying state to false
    const baseAmbients = AMBIENT_SOUNDS.map(sound => {
      const activeMatch = space.ambientSounds.find(a => a.soundId === sound.id);
      return {
        ...sound,
        isPlaying: !!activeMatch,
        volume: activeMatch ? activeMatch.volume : 40
      };
    });
    setAmbientList(baseAmbients);

    // Call audio engine loop
    if (isPlaying) {
      baseAmbients.forEach(async (sound) => {
        await AudioEngine.setAmbientSound(sound.id, sound.isPlaying, sound.volume, sound.audioUrl);
      });
    }
  };

  const selectSpaceAction = (space: Space) => {
    // Stop preceding items if playing
    const wasPlaying = isPlaying;
    AudioEngine.stopActiveSong();
    
    // Stop all active ambients
    ambientList.forEach(async (sound) => {
      if (sound.isPlaying) {
        await AudioEngine.setAmbientSound(sound.id, false, sound.volume, sound.audioUrl);
      }
    });

    setActiveSpace(space);
    setActiveSongId(space.defaultSongId);
    syncSpaceAtmosphere(space);
    const targetSong = SONGS.find(s => s.id === space.defaultSongId) || SONGS[0];
    
    // Automatically boot procedural player
    if (!wasPlaying) {
      setIsPlaying(true);
      AudioEngine.playSong(space.defaultSongId, targetSong.audioUrl);
    } else {
      AudioEngine.playSong(space.defaultSongId, targetSong.audioUrl);
    }
    
    // Fire up active synthe sounds
    space.ambientSounds.forEach(async (mixAtmos) => {
      const ambient = AMBIENT_SOUNDS.find(sound => sound.id === mixAtmos.soundId);
      await AudioEngine.setAmbientSound(mixAtmos.soundId, true, mixAtmos.volume, ambient?.audioUrl);
    });

    // Write play footprint record
    const newRecord: HistoryRecord = {
      id: `history_${Date.now()}`,
      spaceId: space.id,
      spaceTitle: space.title,
      songTitle: targetSong.title,
      songArtist: targetSong.artist,
      playedAt: new Date().toISOString(),
      duration: 180
    };
    const parsedHist = readJson<HistoryRecord[]>('saved_play_history', []);
    writeJson('saved_play_history', [...parsedHist, newRecord]);

    // Open active fullscreen player
    setActiveTab('play');
  };

  // MAIN TOGGLE CONTROLLER
  const handleTogglePlay = () => {
    if (!activeSpace) return;
    
    // Resume/Start context
    AudioEngine.init();

    if (isPlaying) {
      // Pause
      AudioEngine.stopActiveSong();
      // stop all active ambient synths
      ambientList.forEach(async (sound) => {
        if (sound.isPlaying) {
          await AudioEngine.setAmbientSound(sound.id, false, sound.volume, sound.audioUrl);
        }
      });
      setIsPlaying(false);
    } else {
      // Play
      setIsPlaying(true);
      const activeSong = SONGS.find(s => s.id === activeSongId);
      AudioEngine.playSong(activeSongId, activeSong?.audioUrl);
      // turn on active synthe elements
      ambientList.forEach(async (sound) => {
        if (sound.isPlaying) {
          await AudioEngine.setAmbientSound(sound.id, true, sound.volume, sound.audioUrl);
        }
      });
    }
  };

  const handleSetSongVolume = (vol: number) => {
    setSongVolume(vol);
    AudioEngine.setSongVolume(vol);
  };

  const handleSetAmbientVolume = (id: string, vol: number) => {
    setAmbientList(prev => 
      prev.map(sound => {
        if (sound.id === id) {
          AudioEngine.setAmbientVolume(id, vol);
          return { ...sound, volume: vol };
        }
        return sound;
      })
    );
  };

  const handleToggleAmbientSound = async (id: string) => {
    let nextState = false;
    let targetVol = 50;
    
    setAmbientList(prev => 
      prev.map(sound => {
        if (sound.id === id) {
          nextState = !sound.isPlaying;
          targetVol = sound.volume;
          return { ...sound, isPlaying: nextState };
        }
        return sound;
      })
    );

    if (isPlaying) {
      const ambient = AMBIENT_SOUNDS.find(sound => sound.id === id);
      await AudioEngine.setAmbientSound(id, nextState, targetVol, ambient?.audioUrl);
    }
  };

  const handleSelectSong = (songId: string) => {
    setActiveSongId(songId);
    if (isPlaying) {
      const selectedSong = SONGS.find(s => s.id === songId);
      AudioEngine.playSong(songId, selectedSong?.audioUrl);
    }
  };

  // Creation callback
  const handleCreateSpace = (newSpace: Space) => {
    const currentList = readJson<Space[]>('custom_created_spaces', []);
    const updated = [...currentList, newSpace];
    writeJson('custom_created_spaces', updated);
    setSpaces([...DEFAULT_SPACES, ...updated]);
    
    // Navigate back to listing page to spotlight discovery
    setActiveTab('plaza');
  };

  const handleDeleteCustomSpace = (spaceId: string) => {
    const currentList = readJson<Space[]>('custom_created_spaces', []);
    const updated = currentList.filter((s: Space) => s.id !== spaceId);
    writeJson('custom_created_spaces', updated);
    setSpaces([...DEFAULT_SPACES, ...updated]);
  };

  const handleClearHistory = () => {
    removeStoredValue('saved_play_history');
    // reload spaces state list to force footprint redraw
    setSpaces(p => [...p]);
  };

  const handleResetApp = () => {
    localStorage.clear();
    setSpaces([...DEFAULT_SPACES]);
    setActiveSpace(DEFAULT_SPACES[0]);
    setActiveSongId(DEFAULT_SPACES[0].defaultSongId);
    syncSpaceAtmosphere(DEFAULT_SPACES[0]);
    setIsPlaying(false);
    AudioEngine.stopActiveSong();
    setActiveTab('plaza');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Centered Device Viewport for Perfect App Aesthetics */}
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col relative bg-zinc-950 shadow-[0_0_50px_rgba(0,0,0,0.8)] border-x border-zinc-900/40">
        
        {/* Core Screen Render Grid */}
        <div className="flex-1 w-full relative">
          
          {activeTab === 'plaza' && (
            <PlazaScreen
              spaces={spaces}
              mvs={mvs}
              recentSong={SONGS.find(s => s.id === activeSongId) || SONGS[0]}
              isPlaying={isPlaying}
              onSelectSpace={selectSpaceAction}
              onTogglePlay={handleTogglePlay}
              onOpenPlayer={() => setActiveTab('play')}
            />
          )}

          {activeTab === 'play' && activeSpace && (
            <PlayScreen
              space={activeSpace}
              songs={SONGS}
              songVolume={songVolume}
              activeSongId={activeSongId}
              isPlaying={isPlaying}
              ambientSounds={ambientList}
              freqData={freqData}
              onTogglePlay={handleTogglePlay}
              onSetSongVolume={handleSetSongVolume}
              onSetAmbientVolume={handleSetAmbientVolume}
              onToggleAmbientSound={handleToggleAmbientSound}
              onSelectSong={handleSelectSong}
              onClose={() => setActiveTab('plaza')}
            />
          )}

          {activeTab === 'create' && (
            <CreateScreen
              songs={SONGS}
              ambientSounds={AMBIENT_SOUNDS}
              onCreateSpace={handleCreateSpace}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileScreen
              spaces={spaces}
              songs={SONGS}
              onSelectSpace={selectSpaceAction}
              onClearHistory={handleClearHistory}
              onDeleteCustomSpace={handleDeleteCustomSpace}
              onResetApp={handleResetApp}
            />
          )}

        </div>

        {/* Global Floating Bottom Navigation Bar aligned with screenshot exactly */}
        {activeTab !== 'play' && (
          <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 px-6 pb-6 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent pt-4">
            <div 
              style={{ contentVisibility: 'auto' }}
              className="flex items-center justify-between px-3 py-2 bg-neutral-900/90 border border-white/5 backdrop-blur-xl rounded-full shadow-2xl"
            >
              
              {/* Tab 1: Plaza (广场) */}
              <button
                onClick={() => setActiveTab('plaza')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full transition-all duration-350 cursor-pointer text-xs font-semibold ${
                  activeTab === 'plaza'
                    ? 'bg-[#4ade80] text-black font-bold shadow-[0_4px_12px_rgba(74,222,128,0.3)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <LucideIcon name="Compass" size={15} />
                </div>
                <span>广场</span>
              </button>

              {/* Tab 2: Play (播放) */}
              <button
                onClick={() => setActiveTab('play')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-350 cursor-pointer text-xs font-semibold ${
                  activeTab === 'play'
                    ? 'bg-[#4ade80] text-black font-bold shadow-[0_4px_12px_rgba(74,222,128,0.3)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center relative">
                  <LucideIcon name="Music" size={14} />
                  {isPlaying && (
                    <span className="absolute -top-[1px] -right-[1px] w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                  )}
                </div>
                <span>播放</span>
              </button>

              {/* Tab 3: Create (创建) */}
              <button
                onClick={() => setActiveTab('create')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-350 cursor-pointer text-xs font-semibold ${
                  activeTab === 'create'
                    ? 'bg-[#4ade80] text-black font-bold shadow-[0_4px_12px_rgba(74,222,128,0.3)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <LucideIcon name="Plus" size={15} />
                </div>
                <span>创建</span>
              </button>

              {/* Tab 4: Profile (我的) */}
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-350 cursor-pointer text-xs font-semibold ${
                  activeTab === 'profile'
                    ? 'bg-[#4ade80] text-black font-bold shadow-[0_4px_12px_rgba(74,222,128,0.3)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <LucideIcon name="User" size={15} />
                </div>
                <span>我的</span>
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

