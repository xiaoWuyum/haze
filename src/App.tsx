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
import { HomeScreen } from './components/HomeScreen';
import { NowPlayingBanner } from './components/NowPlayingBanner';
import { VideoGenerationToast } from './components/VideoGenerationToast';
import { FluidGlassNavEffect } from './components/FluidGlassNavEffect';
import { motion, AnimatePresence } from 'motion/react';
import { readJson, readNumber, removeStoredValue, writeJson, writeNumber } from './utils/storage';
import { getVideoGenerationJob, requestVideoGeneration, type VideoGenerationJob } from './utils/videoGenerationClient';

type TabType = 'home' | 'plaza' | 'play' | 'create' | 'profile';

export default function App() {
  const [activeTab, setActiveTab ] = useState<TabType>('home');
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [mvs] = useState<Space[]>(DEFAULT_MVS);
  
  // Custom states
  const [activeSpace, setActiveSpace] = useState<Space | null>(null);
  const [activeSongId, setActiveSongId] = useState<string>(SONGS[0].id);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [songVolume, setSongVolume] = useState<number>(60);
  const [ambientList, setAmbientList] = useState<AmbientSound[]>(AMBIENT_SOUNDS);
  const [videoJob, setVideoJob] = useState<VideoGenerationJob | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState('');
  const [videoError, setVideoError] = useState('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [navLens, setNavLens] = useState({ x: 0, y: 0, visible: false });
  const [playImmersive, setPlayImmersive] = useState(false);
  
  // Analyser frequencies
  const [freqData, setFreqData] = useState<number[]>([]);
  const navItems: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'home', label: '首页', icon: 'Home' },
    { id: 'plaza', label: '广场', icon: 'Compass' },
    { id: 'play', label: '播放', icon: 'Music' },
    { id: 'create', label: '创建', icon: 'Plus' },
    { id: 'profile', label: '我的', icon: 'User' },
  ];

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

  useEffect(() => {
    if (!videoJob || videoJob.status === 'completed' || videoJob.status === 'failed') return;

    const interval = window.setInterval(async () => {
      try {
        const nextJob = await getVideoGenerationJob(videoJob.jobId);
        setVideoJob(nextJob);

        if (nextJob.status === 'completed') {
          setIsGeneratingVideo(false);
          if (nextJob.videoUrl) {
            setGeneratedVideoUrl(nextJob.videoUrl);
            setVideoError('');
          } else {
            setVideoError('视频任务已完成，但没有返回 videoUrl。');
          }
        }

        if (nextJob.status === 'failed') {
          setIsGeneratingVideo(false);
          setVideoError(nextJob.error || '视频生成失败。');
        }
      } catch (error) {
        setIsGeneratingVideo(false);
        setVideoError(error instanceof Error ? error.message : '无法读取视频生成状态。');
        setVideoJob(prev => prev ? { ...prev, status: 'failed', error: '无法读取视频生成状态。' } : prev);
      }
    }, 1800);

    return () => window.clearInterval(interval);
  }, [videoJob?.jobId, videoJob?.status]);

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
      AudioEngine.pauseActiveSong();
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
      AudioEngine.playSong(activeSongId, activeSong?.audioUrl, { restart: false });
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

  const handleNextSong = () => {
    const currentIdx = SONGS.findIndex(song => song.id === activeSongId);
    const nextSong = SONGS[(currentIdx + 1 + SONGS.length) % SONGS.length];
    setActiveSongId(nextSong.id);
    if (isPlaying) {
      AudioEngine.playSong(nextSong.id, nextSong.audioUrl);
    }
  };

  const handleGenerateVideo = async (prompt: string) => {
    setIsGeneratingVideo(true);
    setVideoError('');
    setGeneratedVideoUrl('');

    try {
      const job = await requestVideoGeneration({ prompt });
      setVideoJob(job);

      if (job.status === 'completed' && job.videoUrl) {
        setGeneratedVideoUrl(job.videoUrl);
        setIsGeneratingVideo(false);
        return;
      }

      if (job.status === 'failed') {
        setVideoError(job.error || '视频生成失败。');
        setIsGeneratingVideo(false);
        return;
      }
    } catch (error) {
      setIsGeneratingVideo(false);
      setVideoError(error instanceof Error ? error.message : '视频生成请求失败。');
      setVideoJob({
        jobId: `failed_${Date.now()}`,
        provider: 'api',
        status: 'failed',
        error: error instanceof Error ? error.message : '视频生成请求失败。',
      });
    }
  };

  const clearVideoGeneration = () => {
    setVideoJob(null);
    setGeneratedVideoUrl('');
    setVideoError('');
    setIsGeneratingVideo(false);
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
          {activeTab === 'home' && (
            <HomeScreen
              onOpenPlaza={() => setActiveTab('plaza')}
              onOpenPlay={() => setActiveTab('play')}
              onOpenCreate={() => setActiveTab('create')}
            />
          )}
          
          {activeTab === 'plaza' && (
            <PlazaScreen
              spaces={spaces}
              mvs={mvs}
              onSelectSpace={selectSpaceAction}
            />
          )}

          {activeTab === 'play' && activeSpace && (
            <PlayScreen
              space={activeSpace}
              spaces={spaces}
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
              onSelectSpace={selectSpaceAction}
              onImmersiveChange={setPlayImmersive}
              onClose={() => setActiveTab('plaza')}
            />
          )}

          <div className={activeTab === 'create' ? 'block' : 'hidden'}>
            <CreateScreen
              songs={SONGS}
              ambientSounds={AMBIENT_SOUNDS}
              videoJob={videoJob}
              generatedVideoUrl={generatedVideoUrl}
              videoError={videoError}
              isGeneratingVideo={isGeneratingVideo}
              onGenerateVideo={handleGenerateVideo}
              onClearVideoGeneration={clearVideoGeneration}
              onCreateSpace={handleCreateSpace}
            />
          </div>

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
        <>
          <AnimatePresence>
            {videoJob && activeTab !== 'home' && activeTab !== 'create' && activeTab !== 'play' && (
              <VideoGenerationToast
                job={videoJob}
                onOpenCreate={() => setActiveTab('create')}
              />
            )}
          </AnimatePresence>
          {activeTab !== 'home' && activeTab !== 'play' && (
            <NowPlayingBanner
              song={SONGS.find(s => s.id === activeSongId) || SONGS[0]}
              isPlaying={isPlaying}
              onOpenPlayer={() => setActiveTab('play')}
              onTogglePlay={handleTogglePlay}
              onNextSong={handleNextSong}
            />
          )}
          {!(activeTab === 'play' && playImmersive) && (
          <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-[70] px-5 pb-5 pt-7 bg-gradient-to-t from-black/20 via-black/5 to-transparent">
            <div
              style={{ contentVisibility: 'auto' }}
              onPointerMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setNavLens({
                  x: event.clientX - rect.left,
                  y: event.clientY - rect.top,
                  visible: true,
                });
              }}
              onPointerLeave={() => setNavLens(prev => ({ ...prev, visible: false }))}
              className="relative h-[64px] overflow-hidden rounded-[24px] border border-white/30 bg-white/[0.075] shadow-[0_14px_38px_rgba(0,0,0,0.22),inset_0_1px_1px_rgba(255,255,255,0.42)] backdrop-blur-2xl"
            >
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.28),rgba(255,255,255,0.045)_36%,rgba(255,255,255,0.015)_66%,rgba(190,240,255,0.11))]" />
              <div className="pointer-events-none absolute left-5 right-5 top-0 h-px bg-white/50" />
              <div className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-cyan-100/15" />
              <motion.div
                className="fluid-nav-lens pointer-events-none absolute z-0 h-16 w-16 -translate-x-1/2 -translate-y-1/2"
                animate={{
                  x: navLens.x,
                  y: navLens.y,
                  opacity: navLens.visible ? 1 : 0,
                  scale: navLens.visible ? 1 : 0.72,
                }}
                transition={{ type: 'spring', stiffness: 360, damping: 34, mass: 0.7 }}
              >
                <FluidGlassNavEffect />
              </motion.div>
              <div className="relative grid h-full grid-cols-5 p-1.5">
                {navItems.map(item => {
                  const isActive = activeTab === item.id;
                  const iconSize = item.id === 'play' ? 14 : 15;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      aria-pressed={isActive}
                      className={`relative flex min-w-0 items-center justify-center gap-1.5 rounded-[20px] text-xs font-semibold transition-colors duration-300 cursor-pointer ${
                        isActive ? 'text-white' : 'text-white/62 hover:text-white'
                      }`}
                    >
                      <span className="relative z-10 flex h-4 w-4 items-center justify-center">
                        <LucideIcon name={item.icon} size={iconSize} />
                        {item.id === 'play' && isPlaying && (
                          <span className="absolute -top-[1px] -right-[1px] h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.9)] animate-ping" />
                        )}
                      </span>
                      <span className="relative z-10 truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          )}
        </>

      </div>
    </div>
  );
}

