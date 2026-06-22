/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Procedural Audio Engine using Web Audio API
// No assets required, 100% synthesized in-browser, fully customizable

export class AudioEngine {
  private static ctx: AudioContext | null = null;
  private static masterGain: GainNode | null = null;
  private static ambientGains: { [key: string]: GainNode } = {};
  private static ambientSources: { [key: string]: Array<AudioNode> } = {};
  
  // Melody synth properties
  private static songIntervalId: number | null = null;
  private static bpm = 72;
  private static currentStep = 0;
  private static isSongPlaying = false;
  private static songVolume = 60; // 0 - 100
  private static songGain: GainNode | null = null;
  private static activeSongId: string | null = null;
  private static audioElement: HTMLAudioElement | null = null;
  private static audioElementSource: MediaElementAudioSourceNode | null = null;
  private static usingAudioFile = false;
  
  // Callback for beat synchronization (for UI visualizers)
  public static onBeatCallback: ((step: number, freqData: number[]) => void) | null = null;
  private static analyserNode: AnalyserNode | null = null;
  private static animationFrameId: number | null = null;

  // Initialize Audio Context on first User Gesture
  public static init() {
    if (this.ctx) return;
    
    // Create audio context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    this.ctx = new AudioContextClass();
    
    // Setup Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    
    // Setup Analyser Node
    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 64;
    
    // Routing: Source -> Song/Ambient Gains -> Master Gain -> Analyser -> Destination
    this.masterGain.connect(this.analyserNode);
    this.analyserNode.connect(this.ctx.destination);
    
    // Setup Song Gain
    this.songGain = this.ctx.createGain();
    this.songGain.gain.setValueAtTime(this.songVolume / 100, this.ctx.currentTime);
    this.songGain.connect(this.masterGain);
    
    // Start Visualizer analysis loop
    this.runAnalysisLoop();
  }

  // Resume context if suspended
  private static async checkContext(): Promise<boolean> {
    this.init();
    if (!this.ctx) return false;
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return true;
  }

  // Visualizer Analysis Loop
  private static runAnalysisLoop() {
    const analyze = () => {
      this.animationFrameId = requestAnimationFrame(analyze);
      if (!this.analyserNode || !this.ctx) return;
      
      const bufferLength = this.analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      this.analyserNode.getByteFrequencyData(dataArray);
      
      // Map to ordinary array and invoke callback
      if (this.onBeatCallback) {
        // Add some synthesis-driven values if music isn't playing
        const visualData = Array.from(dataArray);
        this.onBeatCallback(this.currentStep, visualData);
      }
    };
    analyze();
  }

  // Noise Buffer Creation
  private static createPinkNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error("Audio Context not initialized");
    const bufferSize = this.ctx.sampleRate * 2.0; // 2 seconds loop
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // normalize
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private static createWhiteNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error("Audio Context not initialized");
    const bufferSize = this.ctx.sampleRate * 2.0;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // START/STOP AMBIENT SYNTHS
  public static async setAmbientSound(id: string, play: boolean, volume = 50) {
    const ok = await this.checkContext();
    if (!ok || !this.ctx || !this.masterGain) return;

    // Create Gain Node if not exists
    if (!this.ambientGains[id]) {
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.connect(this.masterGain);
      this.ambientGains[id] = gain;
    }

    const targetGain = this.ambientGains[id];

    // If turn on
    if (play) {
      targetGain.gain.linearRampToValueAtTime(volume / 100 * 0.5, this.ctx.currentTime + 1.2);
      
      // If already playing nodes, don't recreate
      if (this.ambientSources[id] && this.ambientSources[id].length > 0) return;

      this.ambientSources[id] = [];

      try {
        switch (id) {
          case 'rain': {
            // Rain: low-pass pink noise + random drips
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.createPinkNoiseBuffer();
            noise.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

            noise.connect(filter);
            filter.connect(targetGain);
            noise.start(0);

            this.ambientSources[id].push(noise, filter);

            // Create interval for raindrop dripping synthesis
            const dripInterval = setInterval(() => {
              if (!this.ctx || !this.ambientSources[id] || this.ambientSources[id].length === 0) {
                clearInterval(dripInterval);
                return;
              }
              this.synthesizeRaindrop(targetGain);
            }, 350);
            
            // Store interval ID in sources to clean it up
            (this.ambientSources[id] as any).timerId = dripInterval;
            break;
          }

          case 'waves': {
            // Waves: Pink noise modulated by LFO (0.08Hz, 12 seconds per cycle)
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.createPinkNoiseBuffer();
            noise.loop = true;

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.1, this.ctx.currentTime);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(300, this.ctx.currentTime);

            // LFO
            const lfo = this.ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // 12s cycle

            const lfoGain = this.ctx.createGain();
            lfoGain.gain.setValueAtTime(0.15, this.ctx.currentTime); // mod depth for gain

            const filterModGain = this.ctx.createGain();
            filterModGain.gain.setValueAtTime(500, this.ctx.currentTime); // mod depth for freq (300 to 800Hz)

            // Connect LFO to control noise gain
            lfo.connect(lfoGain);
            // Add bias of 0.2 to avoid silence
            const bias = this.ctx!.createGain();
            bias.gain.setValueAtTime(0.2, this.ctx!.currentTime);
            
            lfoGain.connect(noiseGain.gain);
            lfo.connect(filterModGain);
            filterModGain.connect(filter.frequency);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(targetGain);

            lfo.start(0);
            noise.start(0);

            this.ambientSources[id].push(noise, noiseGain, filter, lfo, lfoGain, filterModGain);
            break;
          }

          case 'fire': {
            // Campfire: Low Rumble pink noise + crackle spikes
            const rumble = this.ctx.createBufferSource();
            rumble.buffer = this.createPinkNoiseBuffer();
            rumble.loop = true;

            const rumbleFilter = this.ctx.createBiquadFilter();
            rumbleFilter.type = 'lowpass';
            rumbleFilter.frequency.setValueAtTime(120, this.ctx.currentTime);

            rumble.connect(rumbleFilter);
            rumbleFilter.connect(targetGain);
            rumble.start(0);

            this.ambientSources[id].push(rumble, rumbleFilter);

            // Spark Crackle timer
            const crackleTimer = setInterval(() => {
              if (!this.ctx || !this.ambientSources[id] || this.ambientSources[id].length === 0) {
                clearInterval(crackleTimer);
                return;
              }
              // Random bonfire crackle
              if (Math.random() > 0.4) {
                this.synthesizeFireCrackle(targetGain);
              }
            }, 180);

            (this.ambientSources[id] as any).timerId = crackleTimer;
            break;
          }

          case 'crickets': {
            // Crickets: High pitch pulsing tones
            const cricketTimer = setInterval(() => {
              if (!this.ctx || !this.ambientSources[id] || this.ambientSources[id].length === 0) {
                clearInterval(cricketTimer);
                return;
              }
              // occasionally chirp
              if (Math.random() > 0.3) {
                this.synthesizeCricketChirp(targetGain);
              }
            }, 2000);

            this.ambientSources[id].push({ stop: () => clearInterval(cricketTimer) } as any);
            (this.ambientSources[id] as any).timerId = cricketTimer;
            break;
          }

          case 'space': {
            // Cosmic Space Drone: 3 Detuned deep sweep oscillators
            const oscIds = [55, 110, 165, 82.4]; // Notes A1, A2, E3, E2
            const nodes: AudioNode[] = [];

            oscIds.forEach((freq, idx) => {
              if (!this.ctx) return;
              const osc = this.ctx.createOscillator();
              osc.type = Math.random() > 0.5 ? 'triangle' : 'sine';
              osc.frequency.setValueAtTime(freq + (Math.random() * 1.5 - 0.75), this.ctx.currentTime);

              const filter = this.ctx.createBiquadFilter();
              filter.type = 'lowpass';
              filter.frequency.setValueAtTime(150 + idx * 50, this.ctx.currentTime);

              const oscGain = this.ctx.createGain();
              oscGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

              // slow pulse
              const lfo = this.ctx.createOscillator();
              lfo.type = 'sine';
              lfo.frequency.setValueAtTime(0.05 + idx * 0.02, this.ctx.currentTime);
              const lfoGain = this.ctx.createGain();
              lfoGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

              lfo.connect(lfoGain);
              lfoGain.connect(oscGain.gain);

              osc.connect(filter);
              filter.connect(oscGain);
              oscGain.connect(targetGain);

              osc.start(0);
              lfo.start(0);

              nodes.push(osc, filter, oscGain, lfo, lfoGain);
            });

            this.ambientSources[id] = nodes;
            break;
          }

          case 'wind': {
            // Autumn Wind: Whispering narrowed bandpass white noise modulated
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.createPinkNoiseBuffer();
            noise.loop = true;

            const bpFilter = this.ctx.createBiquadFilter();
            bpFilter.type = 'bandpass';
            bpFilter.Q.setValueAtTime(12.0, this.ctx.currentTime); // narrow band whistles
            bpFilter.frequency.setValueAtTime(450, this.ctx.currentTime);

            // Modulate whistle pitch
            const lfo = this.ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // slow wind gust

            const lfoGain = this.ctx.createGain();
            lfoGain.gain.setValueAtTime(250, this.ctx.currentTime); // swing 250Hz around 450Hz

            lfo.connect(lfoGain);
            lfoGain.connect(bpFilter.frequency);

            noise.connect(bpFilter);
            bpFilter.connect(targetGain);

            lfo.start(0);
            noise.start(0);

            this.ambientSources[id].push(noise, bpFilter, lfo, lfoGain);
            break;
          }

          case 'vinyl': {
            // Vinyl crackle: low background pink hiss + pops
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.createWhiteNoiseBuffer();
            noise.loop = true;

            const bandpass = this.ctx.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.frequency.setValueAtTime(800, this.ctx.currentTime);
            bandpass.Q.setValueAtTime(1.0, this.ctx.currentTime);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.015, this.ctx.currentTime);

            noise.connect(bandpass);
            bandpass.connect(noiseGain);
            noiseGain.connect(targetGain);
            noise.start(0);

            this.ambientSources[id].push(noise, bandpass, noiseGain);

            // Crackle burst pop timer
            const popTimer = setInterval(() => {
              if (!this.ctx || !this.ambientSources[id] || this.ambientSources[id].length === 0) {
                clearInterval(popTimer);
                return;
              }
              if (Math.random() > 0.5) {
                this.synthesizeVinylPop(targetGain);
              }
            }, 300);

            (this.ambientSources[id] as any).timerId = popTimer;
            break;
          }
        }
      } catch (e) {
        console.error("Failed to start sound synth:", id, e);
      }

    } else {
      // Turn off
      targetGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.2);
      
      // Stop nodes after fade-out
      setTimeout(() => {
        if (!this.ambientSources[id]) return;
        
        // Clear interval timer if exists
        const timerId = (this.ambientSources[id] as any).timerId;
        if (timerId) {
          clearInterval(timerId);
        }

        this.ambientSources[id].forEach((node: any) => {
          if (node && typeof node.stop === 'function') {
            try { node.stop(); } catch (e) {}
          }
        });
        delete this.ambientSources[id];
      }, 1500);
    }
  }

  public static setAmbientVolume(id: string, volume: number) {
    if (!this.ambientGains[id] || !this.ctx) return;
    this.ambientGains[id].gain.linearRampToValueAtTime(volume / 100 * 0.5, this.ctx.currentTime + 0.1);
  }

  // PROCEDURAL AUDIO CLIPS

  private static synthesizeRaindrop(targetNode: AudioNode) {
    if (!this.ctx) return;
    
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    // Random high dripping pitch sweep
    const startFreq = 2200 + Math.random() * 1200;
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(400, time + 0.04);
    
    gain.gain.setValueAtTime(0.0, time);
    // instant attack, speedy decay
    gain.gain.linearRampToValueAtTime(0.01 + Math.random() * 0.03, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
    
    osc.connect(gain);
    gain.connect(targetNode);
    
    osc.start(time);
    osc.stop(time + 0.05);
  }

  private static synthesizeFireCrackle(targetNode: AudioNode) {
    if (!this.ctx) return;
    
    const time = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.01; // extremely short crackle (10ms)
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(6000, time);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.03 + Math.random() * 0.07, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.008);
    
    noise.connect(highpass);
    highpass.connect(gain);
    gain.connect(targetNode);
    
    noise.start(time);
    noise.stop(time + 0.01);
  }

  private static synthesizeVinylPop(targetNode: AudioNode) {
    if (!this.ctx) return;
    const time = this.ctx.currentTime;
    // synthesize a small click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1000 + Math.random() * 2000, time);
    
    gain.gain.setValueAtTime(0.04 * Math.random(), time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.005);
    
    osc.connect(gain);
    gain.connect(targetNode);
    osc.start(time);
    osc.stop(time + 0.01);
  }

  private static synthesizeCricketChirp(targetNode: AudioNode) {
    if (!this.ctx) return;
    const time = this.ctx.currentTime;
    const pulseCount = 3 + Math.floor(Math.random() * 4); // 3-6 tiny fast pulses in a chirp
    const chirpDuration = 0.05;
    
    for (let p = 0; p < pulseCount; p++) {
      const pTime = time + p * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(3800 + Math.random() * 300, pTime); // crickets chirp around 4kHz
      
      gain.gain.setValueAtTime(0.0, pTime);
      gain.gain.linearRampToValueAtTime(0.02, pTime + 0.01);
      gain.gain.linearRampToValueAtTime(0.0, pTime + chirpDuration);
      
      osc.connect(gain);
      gain.connect(targetNode);
      
      osc.start(pTime);
      osc.stop(pTime + chirpDuration + 0.01);
    }
  }

  // PROCEDURAL MUSIC SEQUENCER (DAVID TAO LOFI SYNTH COVERS)

  // Melodies formatted as: ["NoteOctave", stepDuration]  (using simple 16th steps)
  // We'll support standard chord progressions under the Hood that play on steps
  private static CHORDS: { [songId: string]: string[][] } = {
    'putong': [ // 普通朋友 (Cmaj7 - Am7 - Dm7 - G11) in loop
      ['C4', 'E4', 'G4', 'B4'], // Cmaj7
      ['A3', 'C4', 'E4', 'G4'], // Am7
      ['D3', 'F4', 'A4', 'C5'], // Dm7
      ['G3', 'F4', 'A4', 'B4', 'D5'] // G11
    ],
    'season': [ // 寂寞的季节 (Cmaj7 - G/B - Am7 - Em/G - Fmaj7 - C/E - Dm7 - G)
      ['C4', 'E4', 'G4'],
      ['B3', 'D4', 'G4'],
      ['A3', 'C4', 'E4'],
      ['G3', 'B3', 'E4'],
      ['F3', 'A3', 'C4', 'E4'],
      ['E3', 'G3', 'C4'],
      ['D3', 'F3', 'A3', 'D4'],
      ['G3', 'B3', 'D4', 'F4']
    ],
    'beach': [ // 沙滩 (Fmaj9 - Em7 - Dm9 - Cmaj7) - slow, floating
      ['F3', 'A3', 'C4', 'E4', 'G4'],
      ['E3', 'G3', 'B3', 'D4'],
      ['D3', 'F3', 'A3', 'C4', 'E4'],
      ['C3', 'E3', 'G3', 'B3']
    ],
    'melody': [ // Melody ballad progression (Am - Fmaj7 - C - G/B)
      ['A3', 'C4', 'E4'],
      ['F3', 'A3', 'C4', 'E4'],
      ['C4', 'E4', 'G4'],
      ['B3', 'D4', 'G4']
    ],
    'simple': [ // 爱很简单 (G - D/F# - Em - C - Bm7 - Am7 - D)
      ['G3', 'B3', 'D4'],
      ['F#3', 'A3', 'D4'],
      ['E3', 'G3', 'B3'],
      ['C3', 'E3', 'G3'],
      ['B2', 'D4', 'F#4'],
      ['A2', 'C4', 'E4'],
      ['G2', 'B3', 'D4', 'F#4']
    ]
  };

  private static MELODIES: { [songId: string]: { [step: number]: string } } = {
    'putong': { // Ordinary Friends Lead Hook
      0: 'G4', 2: 'A4', 4: 'B4', 6: 'B4', 8: 'A4', 10: 'G4', 12: 'E4', 14: 'G4',
      16: 'A4', 18: 'B4', 20: 'B4', 22: 'D5', 24: 'B4', 26: 'A4', 28: 'G4',
      32: 'G4', 34: 'A4', 36: 'B4', 38: 'B4', 40: 'A4', 42: 'G4', 44: 'B4', 46: 'D5',
      48: 'E5', 50: 'D5', 52: 'B4', 54: 'A4', 56: 'G4', 58: 'A4', 60: 'G4'
    },
    'season': { // Melancholy guitar intro
      0: 'E5', 4: 'D5', 8: 'C5', 12: 'B4', 16: 'A4', 20: 'G4', 24: 'A4', 28: 'B4',
      32: 'C5', 36: 'D5', 40: 'B4', 44: 'G4', 48: 'F4', 52: 'E4', 56: 'D4', 60: 'G4'
    },
    'beach': { // Slow tide waves melody
      0: 'E5', 6: 'D5', 12: 'C5', 16: 'B4', 22: 'A4', 28: 'G4',
      32: 'A4', 38: 'B4', 44: 'C5', 48: 'D5', 54: 'B4', 60: 'G4'
    },
    'melody': { // Melody chorus melody
      0: 'E4', 2: 'A4', 4: 'B4', 6: 'C5', 8: 'C5', 10: 'B4', 12: 'A4', 14: 'E4',
      16: 'F4', 18: 'A4', 20: 'B4', 22: 'C5', 24: 'C5', 26: 'D5', 28: 'E5',
      32: 'E5', 34: 'D5', 36: 'C5', 38: 'G5', 40: 'E5', 44: 'D5', 48: 'D5', 52: 'C5', 56: 'B4', 60: 'G4'
    },
    'simple': { // Sweet piano melody
      0: 'D4', 2: 'G4', 4: 'B4', 6: 'D5', 8: 'D5', 10: 'C5', 12: 'B4', 14: 'G4',
      16: 'A4', 18: 'B4', 20: 'C5', 22: 'C5', 24: 'B4', 26: 'A4', 28: 'C5',
      32: 'B4', 34: 'G4', 36: 'B4', 40: 'A4', 44: 'G4', 48: 'G4', 52: 'F#4', 56: 'G4'
    }
  };

  private static noteToFreq(note: string): number {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const regex = /^([C-DF-G-A-B]#?)([0-9])$/i;
    const match = note.match(regex);
    if (!match) return 440;
    
    const letter = match[1].toUpperCase();
    const octave = parseInt(match[2]);
    const key = notes.indexOf(letter);
    
    // Calculate relative frequency from A4 (440Hz)
    // A4 is octave 4, key index 9
    const keyNumber = key + (octave * 12);
    // 69 represents A4 in MIDI layout.
    const difference = keyNumber - 57; // keyNumber for A4 is 57 (9 + 48) inside this local scale
    return 440 * Math.pow(2, difference / 12);
  }

  private static async tryPlayAudioFile(audioUrl?: string): Promise<boolean> {
    if (!audioUrl || !this.ctx || !this.songGain) return false;

    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.loop = true;
      this.audioElement.preload = 'auto';
      this.audioElement.crossOrigin = 'anonymous';
      this.audioElementSource = this.ctx.createMediaElementSource(this.audioElement);
      this.audioElementSource.connect(this.songGain);
    }

    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    this.audioElement.src = audioUrl;
    this.audioElement.volume = 1;

    try {
      await this.audioElement.play();
      this.usingAudioFile = true;
      return true;
    } catch (error) {
      console.warn(`Unable to play audio file ${audioUrl}; falling back to synth playback.`, error);
      this.audioElement.pause();
      this.usingAudioFile = false;
      return false;
    }
  }

  // Trigger synthesized song notes
  public static async playSong(songId: string, audioUrl?: string) {
    await this.checkContext();
    this.stopActiveSong();
    
    this.activeSongId = songId;
    this.currentStep = 0;
    this.isSongPlaying = true;

    if (await this.tryPlayAudioFile(audioUrl)) {
      return;
    }
    
    const fallbackSongId = this.CHORDS[songId] ? songId : 'putong';
    this.bpm = fallbackSongId === 'putong' || fallbackSongId === 'melody' ? 84 : 70; // Set appropriate tempo

    const stepDurationMs = (60 / this.bpm) / 4 * 1000; // 16th steps

    let lastBeatTime = 0;

    const playStep = () => {
      if (!this.isSongPlaying || !this.ctx || !this.songGain) return;
      
      const time = this.ctx.currentTime;
      const stepIdx = this.currentStep % 64; // Loop 64 steps (4 bars)
      
      // Determine what chord to play (every 16 steps/1 bar represents 1 chord)
      const barIdx = Math.floor(stepIdx / 16);
      const chordsAvailable = this.CHORDS[fallbackSongId] || [];
      const currentChord = chordsAvailable[barIdx % chordsAvailable.length];
      
      // Every 1 bar, play a soft Rhodes chord
      if (stepIdx % 16 === 0 && currentChord) {
        this.synthesizeRhodesChord(currentChord, 0.4, 3.2);
        this.synthesizeLoFiKick(0.5);
      }

      // Snare on 4 and 12 of each 16 steps bar (Standard LoFi rimshot)
      if (stepIdx % 16 === 4 || stepIdx % 16 === 12) {
        this.synthesizeLoFiRimshot(0.3);
      }
      
      // Kick rhythm on 0, 10, 24
      if (stepIdx % 16 === 10 || stepIdx % 16 === 24) {
        this.synthesizeLoFiKick(0.35);
      }

      // Steady soft hihats on even steps
      if (stepIdx % 4 === 2) {
        this.synthesizeHihat(0.12);
      }

      // Check for lead melody note
      const melodyAvailable = this.MELODIES[fallbackSongId] || {};
      const melodyNote = melodyAvailable[stepIdx];
      if (melodyNote) {
        const instrument = (fallbackSongId === 'season') ? 'guitar' : 'rhodes';
        this.synthesizePianoLead(melodyNote, 0.28, 0.8, instrument);
      }

      // Simple bass line on step 0 and 8
      if (stepIdx % 8 === 0 && currentChord) {
        const rootBassNote = currentChord[0]; // grab lower root note
        // Transpose root note down an octave
        const letter = rootBassNote.slice(0, -1);
        const oct = parseInt(rootBassNote.slice(-1));
        const bassNote = `${letter}${oct - 1}`;
        this.synthesizeBass(bassNote, 0.22, 1.2);
      }

      // Advance
      this.currentStep++;

      // Schedule next step
      this.songIntervalId = window.setTimeout(playStep, stepDurationMs);
    };

    playStep();
  }

  public static stopActiveSong() {
    this.isSongPlaying = false;
    this.usingAudioFile = false;
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    if (this.songIntervalId) {
      clearTimeout(this.songIntervalId);
      this.songIntervalId = null;
    }
  }

  public static setSongVolume(volume: number) {
    this.songVolume = volume;
    if (this.songGain && this.ctx) {
      this.songGain.gain.setValueAtTime(volume / 100, this.ctx.currentTime);
    }
  }

  // INSTRUMENTS SYNTHESIS METHODS
  
  // 1. Rhodes Electric Piano Coziness (warm sine + lowpass + tremolo)
  private static synthesizeRhodesChord(notes: string[], volume: number, duration: number) {
    if (!this.ctx || !this.songGain) return;
    const time = this.ctx.currentTime;
    
    notes.forEach((note, idx) => {
      if (!this.ctx) return;
      const freq = this.noteToFreq(note);
      
      // Two operators (additive model) for Rhodes warmth
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, time);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, time); // 1 octave up overtones

      // Detuning slightly for beautiful lush chorus
      osc1.detune.setValueAtTime(idx % 2 === 0 ? 5 : -5, time);

      // Routing
      const osc2Gain = this.ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.04, time); // quiet triangle chime
      
      // Tremolo (LFO) for that Rhodes vibe
      const tremolo = this.ctx.createOscillator();
      tremolo.type = 'sine';
      tremolo.frequency.setValueAtTime(4.5, time); // 4.5Hz wobble
      const tremoloGain = this.ctx.createGain();
      tremoloGain.gain.setValueAtTime(0.18, time); // tremolo depth

      const nodeBias = this.ctx.createGain();
      nodeBias.gain.setValueAtTime(0.8, time);

      tremolo.connect(tremoloGain);
      tremoloGain.connect(nodeBias.gain);

      noteGain.gain.setValueAtTime(0, time);
      // Soft attack, slow decay
      noteGain.gain.linearRampToValueAtTime(volume * 0.12, time + 0.08); // chord level divided amongst notes
      noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc1.connect(nodeBias);
      osc2.connect(osc2Gain);
      osc2Gain.connect(nodeBias);
      
      nodeBias.connect(noteGain);
      noteGain.connect(this.songGain!);

      tremolo.start(time);
      osc1.start(time);
      osc2.start(time);

      tremolo.stop(time + duration + 0.1);
      osc1.stop(time + duration + 0.1);
      osc2.stop(time + duration + 0.1);
    });
  }

  // 2. Smooth Leads (Pluck synth or Acoustic feel)
  private static synthesizePianoLead(note: string, volume: number, duration: number, type: 'guitar' | 'rhodes' = 'rhodes') {
    if (!this.ctx || !this.songGain) return;
    const time = this.ctx.currentTime;
    const freq = this.noteToFreq(note);

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type === 'guitar' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(type === 'guitar' ? 1800 : 1200, time);

    gainNode.gain.setValueAtTime(0, time);
    // instant attack, exponential fade
    gainNode.gain.linearRampToValueAtTime(volume, time + 0.004);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    // If guitar pluck, add slight high pass clicking attack transient
    if (type === 'guitar') {
      const click = this.ctx.createOscillator();
      click.type = 'sine';
      click.frequency.setValueAtTime(freq * 4, time);
      const clickGain = this.ctx.createGain();
      clickGain.gain.setValueAtTime(0.3 * volume, time);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.015);
      click.connect(clickGain);
      clickGain.connect(this.songGain);
      click.start(time);
      click.stop(time + 0.02);
    }

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.songGain);

    osc.start(time);
    osc.stop(time + duration + 0.1);
  }

  // 3. Sub Bass (Deep filtered sine wave)
  private static synthesizeBass(note: string, volume: number, duration: number) {
    if (!this.ctx || !this.songGain) return;
    const time = this.ctx.currentTime;
    const freq = this.noteToFreq(note);

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gainNode = this.ctx.createGain();

    osc.type = 'triangle'; // triangle has punchy harmonics
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(90, time); // cut off everything above 90Hz for high-grade sub bass

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(volume, time + 0.04); // smooth entry
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.songGain);

    osc.start(time);
    osc.stop(time + duration + 0.1);
  }

  // 4. Punchy soft LoFi Kick drum
  private static synthesizeLoFiKick(volume: number) {
    if (!this.ctx || !this.songGain) return;
    const time = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    // Pitch sweeps from 120Hz -> 50Hz very fast for the soft thud
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.08);

    gainNode.gain.setValueAtTime(volume, time);
    gainNode.gain.linearRampToValueAtTime(0.001, time + 0.15); // quiet fast release

    osc.connect(gainNode);
    gainNode.connect(this.songGain);

    osc.start(time);
    osc.stop(time + 0.18);
  }

  // 5. Retro LoFi Side/Cross Rimshot
  private static synthesizeLoFiRimshot(volume: number) {
    if (!this.ctx || !this.songGain) return;
    const time = this.ctx.currentTime;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createBufferOfHighpassNoise();

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1400, time); // timber of rimshot
    bandpass.Q.setValueAtTime(4, time);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(volume, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.04); // fast pop

    noise.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(this.songGain);

    noise.start(time);
    noise.stop(time + 0.05);

    // Layer a short metallic mid-frequency resonance pop
    const snap = this.ctx.createOscillator();
    snap.type = 'triangle';
    snap.frequency.setValueAtTime(480, time);
    const snapGain = this.ctx.createGain();
    snapGain.gain.setValueAtTime(volume * 0.4, time);
    snapGain.gain.exponentialRampToValueAtTime(0.001, time + 0.015);
    snap.connect(snapGain);
    snapGain.connect(this.songGain);
    snap.start(time);
    snap.stop(time + 0.02);
  }

  // Helper for rimshot noise
  private static createBufferOfHighpassNoise(): AudioBuffer {
    if (!this.ctx) throw new Error("Context missing");
    const size = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) {
      channel[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // 6. Gentle Hihat
  private static synthesizeHihat(volume: number) {
    if (!this.ctx || !this.songGain) return;
    const time = this.ctx.currentTime;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createWhiteNoiseBuffer();

    const hpFilter = this.ctx.createBiquadFilter();
    hpFilter.type = 'highpass';
    hpFilter.frequency.setValueAtTime(8000, time); // top-end air

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(volume, time);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.02); // very fast sizzle

    noise.connect(hpFilter);
    hpFilter.connect(gainNode);
    gainNode.connect(this.songGain);

    noise.start(time);
    noise.stop(time + 0.03);
  }
}
