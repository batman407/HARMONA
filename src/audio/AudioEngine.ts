/**
 * HARMONA Web Audio Acoustic Synthesis Engine
 * Provides physical modeling, Karplus-Strong string synthesis,
 * Bessel circular membrane synthesis, resonant subtractive filters,
 * reed aerophone aeroacoustics, and live AnalyserNode FFT / Oscilloscope.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private waveformBuffer: Uint8Array<ArrayBuffer> | null = null;
  private frequencyBuffer: Uint8Array<ArrayBuffer> | null = null;

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.82;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.waveformBuffer = new Uint8Array(this.analyser.fftSize) as Uint8Array<ArrayBuffer>;
    this.frequencyBuffer = new Uint8Array(this.analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
  }

  public async ensureContext(): Promise<AudioContext> {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return this.ctx!;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getWaveformData(): Uint8Array<ArrayBuffer> {
    if (!this.analyser || !this.waveformBuffer) return new Uint8Array(1024) as Uint8Array<ArrayBuffer>;
    this.analyser.getByteTimeDomainData(this.waveformBuffer);
    return this.waveformBuffer;
  }

  public getFrequencyData(): Uint8Array<ArrayBuffer> {
    if (!this.analyser || !this.frequencyBuffer) return new Uint8Array(1024) as Uint8Array<ArrayBuffer>;
    this.analyser.getByteFrequencyData(this.frequencyBuffer);
    return this.frequencyBuffer;
  }

  public setVolume(val: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }

  /**
   * 1. Acoustic Guitar: Karplus-Strong Plucked String Synthesis
   */
  public async playGuitarString(freq: number = 196, duration: number = 2.5) {
    const ctx = await this.ensureContext();
    const sampleRate = ctx.sampleRate;
    const period = Math.round(sampleRate / freq);
    const bufferSize = Math.max(period, Math.floor(sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < period; i++) {
      channelData[i] = (Math.random() * 2 - 1) * 0.95;
    }

    const damping = 0.988 - (freq / 4000) * 0.04;
    for (let i = period; i < bufferSize; i++) {
      const sample1 = channelData[i - period];
      const sample2 = channelData[i - period + 1] || 0;
      channelData[i] = 0.5 * (sample1 + sample2) * damping;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const bodyFilter = ctx.createBiquadFilter();
    bodyFilter.type = 'peaking';
    bodyFilter.frequency.value = 105;
    bodyFilter.Q.value = 3.2;
    bodyFilter.gain.value = 6.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.85, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    source.connect(bodyFilter);
    bodyFilter.connect(gain);
    gain.connect(this.masterGain!);

    source.start(ctx.currentTime);
    source.stop(ctx.currentTime + duration);
  }

  /**
   * 2. Electric Guitar: Magnetic pickup induction + amp distortion simulation
   */
  public async playElectricGuitar(freq: number = 220, duration: number = 2.2) {
    const ctx = await this.ensureContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 1.002, now); // slight chorus detune

    // Magnetic pickup high-cut
    const pickupFilter = ctx.createBiquadFilter();
    pickupFilter.type = 'lowpass';
    pickupFilter.frequency.setValueAtTime(3200, now);

    // WaveShaper for tube amp warmth
    const shaper = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = ((Math.PI + 4) * x) / (Math.PI + 4 * Math.abs(x));
    }
    shaper.curve = curve;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.65, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.35, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(pickupFilter);
    osc2.connect(pickupFilter);
    pickupFilter.connect(shaper);
    shaper.connect(gain);
    gain.connect(this.masterGain!);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  /**
   * 3. Bass Guitar: Heavy fundamental + sub-harmonic rumble + pickup punch
   */
  public async playBassGuitar(freq: number = 82.4, duration: number = 2.8) {
    const ctx = await this.ensureContext();
    const now = ctx.currentTime;

    const oscFund = ctx.createOscillator();
    const oscSub = ctx.createOscillator();
    const oscClick = ctx.createOscillator();

    oscFund.type = 'triangle';
    oscFund.frequency.setValueAtTime(freq, now);

    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(freq * 0.5, now); // Sub-octave

    // Pluck snap click
    oscClick.type = 'sawtooth';
    oscClick.frequency.setValueAtTime(freq * 3, now);

    const bassFilter = ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(1400, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.85, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.5, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.4, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    oscFund.connect(bassFilter);
    oscSub.connect(bassFilter);
    oscClick.connect(clickGain);
    clickGain.connect(bassFilter);
    bassFilter.connect(gain);
    gain.connect(this.masterGain!);

    oscFund.start(now);
    oscSub.start(now);
    oscClick.start(now);
    oscFund.stop(now + duration);
    oscSub.stop(now + duration);
    oscClick.stop(now + 0.05);
  }

  /**
   * 4. Violin: Bowed Helmholtz stick-slip sawtooth + vibrato LFO + body resonance
   */
  public async playViolin(freq: number = 440, duration: number = 2.5) {
    const ctx = await this.ensureContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    // Expressive vibrato LFO (5.5 Hz)
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibrato.frequency.setValueAtTime(5.5, now);
    vibratoGain.gain.setValueAtTime(freq * 0.018, now); // subtle pitch excursion
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    // Wood body formant (bridge resonance ~3000 Hz and body ~500 Hz)
    const bodyFilter = ctx.createBiquadFilter();
    bodyFilter.type = 'bandpass';
    bodyFilter.frequency.setValueAtTime(2800, now);
    bodyFilter.Q.setValueAtTime(1.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.6, now + 0.15); // Smooth bowed attack
    gain.gain.setValueAtTime(0.55, now + duration - 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(bodyFilter);
    bodyFilter.connect(gain);
    gain.connect(this.masterGain!);

    vibrato.start(now + 0.1);
    osc.start(now);
    vibrato.stop(now + duration);
    osc.stop(now + duration);
  }

  /**
   * 5. Concert Harp: Shimmering plucked string + crystalline upper register
   */
  public async playHarp(freq: number = 523.25, duration: number = 3.0) {
    const ctx = await this.ensureContext();
    const now = ctx.currentTime;

    // Dual sine/triangle harmonic shimmer
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 2, now);

    const shimmerGain = ctx.createGain();
    shimmerGain.gain.setValueAtTime(0.35, now);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.4);

    const masterHarpGain = ctx.createGain();
    masterHarpGain.gain.setValueAtTime(0.0, now);
    masterHarpGain.gain.linearRampToValueAtTime(0.7, now + 0.008);
    masterHarpGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(masterHarpGain);
    osc2.connect(shimmerGain);
    shimmerGain.connect(masterHarpGain);
    masterHarpGain.connect(this.masterGain!);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  /**
   * 6. Grand Piano Synthesis: Hammer strike impulse + coupled unisons + soundboard
   */
  public async playPianoKey(freq: number = 440, duration: number = 3.5) {
    const ctx = await this.ensureContext();
    const now = ctx.currentTime;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.75, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.35, now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const harmonicWeights = [1.0, 0.65, 0.45, 0.3, 0.18, 0.09, 0.04];
    const B = 0.00015;

    harmonicWeights.forEach((weight, index) => {
      const n = index + 1;
      const harmonicFreq = n * freq * Math.sqrt(1 + B * n * n);
      if (harmonicFreq > 16000) return;

      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = n % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(harmonicFreq, now);

      if (n <= 2) {
        osc.detune.setValueAtTime((Math.random() * 2 - 1) * 3.5, now);
      }

      oscGain.gain.setValueAtTime(weight, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration / (n * 0.45 + 0.55));

      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(now);
      osc.stop(now + duration);
    });

    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.frequency.setValueAtTime(80, now);
    thudGain.gain.setValueAtTime(0.4, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
    thud.connect(thudGain);
    thudGain.connect(gain);
    thud.start(now);
    thud.stop(now + 0.03);

    gain.connect(this.masterGain!);
  }

  /**
   * 7. Pipe Organ: Multivoice flue pipe ranks + transient air chiff
   */
  public async playPipeOrgan(freq: number = 261.63, duration: number = 3.0) {
    const ctx = await this.ensureContext();
    const now = ctx.currentTime;

    const organGain = ctx.createGain();
    organGain.gain.setValueAtTime(0.0, now);
    organGain.gain.linearRampToValueAtTime(0.55, now + 0.08); // Steady wind inflation
    organGain.gain.setValueAtTime(0.5, now + duration - 0.1);
    organGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Additive pipe harmonic mixture: 8', 4', 2' stops
    const stopMultipliers = [1.0, 2.0, 3.0, 4.0];
    const stopGains = [0.6, 0.4, 0.25, 0.15];

    stopMultipliers.forEach((mult, i) => {
      const pipeOsc = ctx.createOscillator();
      pipeOsc.type = 'sine';
      pipeOsc.frequency.setValueAtTime(freq * mult, now);

      const pGain = ctx.createGain();
      pGain.gain.setValueAtTime(stopGains[i], now);

      pipeOsc.connect(pGain);
      pGain.connect(organGain);
      pipeOsc.start(now);
      pipeOsc.stop(now + duration);
    });

    // Air chiff transient (puff at start of flue)
    const chiff = ctx.createOscillator();
    const chiffGain = ctx.createGain();
    chiff.type = 'sawtooth';
    chiff.frequency.setValueAtTime(freq * 6, now);
    chiffGain.gain.setValueAtTime(0.12, now);
    chiffGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    chiff.connect(chiffGain);
    chiffGain.connect(organGain);
    chiff.start(now);
    chiff.stop(now + 0.06);

    organGain.connect(this.masterGain!);
  }

  /**
   * 8. Snare Drum Synthesis: Bessel circular membrane modes + high frequency snare noise burst
   */
  public async playDrumStrike(centerFreq: number = 200, duration: number = 0.8) {
    const ctx = await this.ensureContext();
    const now = ctx.currentTime;

    const besselRatios = [1.0, 1.593, 2.135, 2.295];
    const besselGains = [0.8, 0.45, 0.25, 0.2];

    const drumGain = ctx.createGain();
    drumGain.gain.setValueAtTime(0.9, now);
    drumGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    besselRatios.forEach((ratio, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(centerFreq * ratio, now);
      osc.frequency.exponentialRampToValueAtTime(centerFreq * ratio * 0.75, now + 0.06);

      oscGain.gain.setValueAtTime(besselGains[idx], now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.45);

      osc.connect(oscGain);
      oscGain.connect(drumGain);
      osc.start(now);
      osc.stop(now + duration);
    });

    const noiseDuration = duration * 0.7;
    const noiseBufferSize = Math.floor(ctx.sampleRate * noiseDuration);
    const noiseBuffer = ctx.createBuffer(1, noiseBufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1200, now);

    const snareGain = ctx.createGain();
    snareGain.gain.setValueAtTime(0.7, now);
    snareGain.gain.exponentialRampToValueAtTime(0.0001, now + noiseDuration);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(snareGain);
    snareGain.connect(drumGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + noiseDuration);

    drumGain.connect(this.masterGain!);
  }

  /**
   * 9. Drum Kit: Specialized sounds for Kick, Snare, Hi-Hat, Tom, Crash
   */
  public async playDrumKitElement(freq: number = 60, duration: number = 0.9) {
    const ctx = await this.ensureContext();
    const now = ctx.currentTime;

    if (freq <= 70) {
      // Bass Kick Drum
      const osc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

      kickGain.gain.setValueAtTime(1.0, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(kickGain);
      kickGain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (freq >= 400) {
      // Hi-Hat / Cymbal
      const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.25), ctx.sampleRate);
      const out = noiseBuffer.getChannelData(0);
      for (let i = 0; i < out.length; i++) out[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(7500, now);

      const hatGain = ctx.createGain();
      hatGain.gain.setValueAtTime(0.5, now);
      hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      noise.connect(hp);
      hp.connect(hatGain);
      hatGain.connect(this.masterGain!);
      noise.start(now);
      noise.stop(now + 0.25);
    } else {
      // Snare / Tom
      return this.playDrumStrike(freq, duration);
    }
  }

  /**
   * 10. Djembe: West African goblet drum with deep bass resonance and sharp edge slap
   */
  public async playDjembe(freq: number = 110, duration: number = 0.9) {
    const ctx = await this.ensureContext();
    const now = ctx.currentTime;

    const djembeGain = ctx.createGain();
    djembeGain.gain.setValueAtTime(0.9, now);
    djembeGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Deep goblet cavity thud
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(freq * 1.2, now);
    bassOsc.frequency.exponentialRampToValueAtTime(freq * 0.8, now + 0.08);
    bassGain.gain.setValueAtTime(0.85, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.6);

    bassOsc.connect(bassGain);
    bassGain.connect(djembeGain);

    // Rim slap high frequency transient
    if (freq > 180) {
      const slapOsc = ctx.createOscillator();
      const slapGain = ctx.createGain();
      slapOsc.type = 'triangle';
      slapOsc.frequency.setValueAtTime(freq * 2.5, now);
      slapGain.gain.setValueAtTime(0.6, now);
      slapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      slapOsc.connect(slapGain);
      slapGain.connect(djembeGain);
      slapOsc.start(now);
      slapOsc.stop(now + 0.08);
    }

    djembeGain.connect(this.masterGain!);
    bassOsc.start(now);
    bassOsc.stop(now + duration);
  }

  /**
   * 11. Bb Trumpet: Bright brassy sawtooth harmonics + flared bell formant
   */
  public async playTrumpetNote(freq: number = 349.23, duration: number = 2.0) {
    const ctx = await this.ensureContext();
    const now = ctx.currentTime;

    const brassGain = ctx.createGain();
    brassGain.gain.setValueAtTime(0.0, now);
    brassGain.gain.linearRampToValueAtTime(0.65, now + 0.04);
    brassGain.gain.setValueAtTime(0.6, now + duration - 0.1);
    brassGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const harmonics = [1.0, 0.9, 0.8, 0.75, 0.65, 0.55, 0.4, 0.3, 0.2];

    harmonics.forEach((weight, i) => {
      const n = i + 1;
      const harmonicFreq = freq * n;
      if (harmonicFreq > 18000) return;

      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(harmonicFreq, now);

      oscGain.gain.setValueAtTime(weight * 0.15, now);

      osc.connect(oscGain);
      oscGain.connect(brassGain);
      osc.start(now);
      osc.stop(now + duration);
    });

    const formantFilter = ctx.createBiquadFilter();
    formantFilter.type = 'bandpass';
    formantFilter.frequency.setValueAtTime(1400, now);
    formantFilter.Q.setValueAtTime(2.5, now);

    brassGain.connect(formantFilter);
    formantFilter.connect(this.masterGain!);
  }

  /**
   * 12. Trombone: Warm deep slide brass aerophone
   */
  public async playTrombone(freq: number = 174.61, duration: number = 2.2) {
    const ctx = await this.ensureContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    // Portamento slide simulation
    osc.frequency.setValueAtTime(freq * 0.98, now);
    osc.frequency.linearRampToValueAtTime(freq, now + 0.08);

    const formant = ctx.createBiquadFilter();
    formant.type = 'lowpass';
    formant.frequency.setValueAtTime(950, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.7, now + 0.06);
    gain.gain.setValueAtTime(0.65, now + duration - 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(formant);
    formant.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * 13. Alto Saxophone: Single cane reed conical bore aerophone
   */
  public async playSaxophone(freq: number = 329.63, duration: number = 2.4) {
    const ctx = await this.ensureContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq, now);

    // Warm conical bore formant filter (~1200 Hz with moderate resonance)
    const boreFilter = ctx.createBiquadFilter();
    boreFilter.type = 'bandpass';
    boreFilter.frequency.setValueAtTime(1250, now);
    boreFilter.Q.setValueAtTime(1.4, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.65, now + 0.05); // Breath attack
    gain.gain.setValueAtTime(0.6, now + duration - 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(boreFilter);
    osc2.connect(boreFilter);
    boreFilter.connect(gain);
    gain.connect(this.masterGain!);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  /**
   * 14. Concert Flute: Pure sinusoidal edge-tone + delicate breath air chiff
   */
  public async playFlute(freq: number = 440, duration: number = 2.5) {
    const ctx = await this.ensureContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 2, now); // Gentle octave harmonic

    // Subtle breath air noise
    const breathSize = Math.floor(ctx.sampleRate * 0.3);
    const breathBuf = ctx.createBuffer(1, breathSize, ctx.sampleRate);
    const bData = breathBuf.getChannelData(0);
    for (let i = 0; i < breathSize; i++) bData[i] = Math.random() * 2 - 1;

    const breathSource = ctx.createBufferSource();
    breathSource.buffer = breathBuf;

    const breathFilter = ctx.createBiquadFilter();
    breathFilter.type = 'bandpass';
    breathFilter.frequency.setValueAtTime(2500, now);
    breathFilter.Q.setValueAtTime(2.0, now);

    const breathGain = ctx.createGain();
    breathGain.gain.setValueAtTime(0.08, now);
    breathGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    breathSource.connect(breathFilter);
    breathFilter.connect(breathGain);

    const fluteGain = ctx.createGain();
    fluteGain.gain.setValueAtTime(0.0, now);
    fluteGain.gain.linearRampToValueAtTime(0.65, now + 0.08);
    fluteGain.gain.setValueAtTime(0.6, now + duration - 0.15);
    fluteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(fluteGain);
    const hGain = ctx.createGain();
    hGain.gain.setValueAtTime(0.18, now);
    osc2.connect(hGain);
    hGain.connect(fluteGain);
    breathGain.connect(fluteGain);

    fluteGain.connect(this.masterGain!);

    osc1.start(now);
    osc2.start(now);
    breathSource.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
    breathSource.stop(now + 0.3);
  }

  /**
   * 15. Analog Synthesizer: Detuned saw + 24dB ladder resonant low-pass filter sweep
   */
  public async playSynthesizer(freq: number = 261.63, duration: number = 2.5) {
    const ctx = await this.ensureContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 1.006, now); // Fat analog detune

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(6.0, now); // Resonant squelch
    // Filter envelope sweep
    filter.frequency.setValueAtTime(freq * 1.5, now);
    filter.frequency.exponentialRampToValueAtTime(freq * 8, now + 0.15);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.8, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.65, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.4, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  /**
   * 16. West African Kora: Spike harp-lute pluck with calabash gourd resonance
   */
  public async playKora(freq: number = 220, duration: number = 2.6) {
    const ctx = await this.ensureContext();
    const now = ctx.currentTime;

    // Crisp pluck tone with rapid decay + warm gourd body
    const oscPluck = ctx.createOscillator();
    const oscBody = ctx.createOscillator();
    oscPluck.type = 'triangle';
    oscBody.type = 'sine';

    oscPluck.frequency.setValueAtTime(freq, now);
    oscBody.frequency.setValueAtTime(freq * 0.5, now);

    const pluckGain = ctx.createGain();
    pluckGain.gain.setValueAtTime(0.0, now);
    pluckGain.gain.linearRampToValueAtTime(0.75, now + 0.005);
    pluckGain.gain.exponentialRampToValueAtTime(0.25, now + 0.2);
    pluckGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Calabash air resonator filter
    const gourdFilter = ctx.createBiquadFilter();
    gourdFilter.type = 'peaking';
    gourdFilter.frequency.setValueAtTime(140, now);
    gourdFilter.gain.setValueAtTime(5.0, now);
    gourdFilter.Q.setValueAtTime(2.0, now);

    oscPluck.connect(pluckGain);
    oscBody.connect(pluckGain);
    pluckGain.connect(gourdFilter);
    gourdFilter.connect(this.masterGain!);

    oscPluck.start(now);
    oscBody.start(now);
    oscPluck.stop(now + duration);
    oscBody.stop(now + duration);
  }

  /**
   * 17. Kalimba (Thumb Piano): Cantilever steel tine modal frequencies (1x fundamental, 6.27x modal overtone)
   */
  public async playKalimba(freq: number = 329.63, duration: number = 3.2) {
    const ctx = await this.ensureContext();
    const now = ctx.currentTime;

    // Fundamental bar vibration mode
    const oscFund = ctx.createOscillator();
    oscFund.type = 'sine';
    oscFund.frequency.setValueAtTime(freq, now);

    // Cantilever 1st overtone mode (~6.27x fundamental)
    const oscModal = ctx.createOscillator();
    oscModal.type = 'sine';
    oscModal.frequency.setValueAtTime(Math.min(freq * 6.27, 18000), now);

    const fundGain = ctx.createGain();
    fundGain.gain.setValueAtTime(0.0, now);
    fundGain.gain.linearRampToValueAtTime(0.8, now + 0.003); // Instant thumb flick
    fundGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const modalGain = ctx.createGain();
    modalGain.gain.setValueAtTime(0.25, now);
    modalGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08); // High metal ping decays very fast

    // Wood soundboard warm resonance
    const woodFilter = ctx.createBiquadFilter();
    woodFilter.type = 'lowpass';
    woodFilter.frequency.setValueAtTime(3200, now);

    oscFund.connect(fundGain);
    oscModal.connect(modalGain);
    fundGain.connect(woodFilter);
    modalGain.connect(woodFilter);
    woodFilter.connect(this.masterGain!);

    oscFund.start(now);
    oscModal.start(now);
    oscFund.stop(now + duration);
    oscModal.stop(now + duration);
  }

  /**
   * Universal Instrument Note Dispatcher
   */
  public playInstrumentNote(instrumentId: string, freq: number, duration: number = 2.0) {
    switch (instrumentId) {
      case 'guitar':
        return this.playGuitarString(freq, duration);
      case 'electric_guitar':
        return this.playElectricGuitar(freq, duration);
      case 'bass_guitar':
        return this.playBassGuitar(freq, duration);
      case 'violin':
        return this.playViolin(freq, duration);
      case 'harp':
        return this.playHarp(freq, duration);
      case 'piano':
        return this.playPianoKey(freq, duration);
      case 'pipe_organ':
        return this.playPipeOrgan(freq, duration);
      case 'drum':
        return this.playDrumStrike(freq, duration * 0.5);
      case 'drum_kit':
        return this.playDrumKitElement(freq, duration);
      case 'djembe':
        return this.playDjembe(freq, duration);
      case 'trumpet':
        return this.playTrumpetNote(freq, duration);
      case 'trombone':
        return this.playTrombone(freq, duration);
      case 'alto_saxophone':
        return this.playSaxophone(freq, duration);
      case 'flute':
        return this.playFlute(freq, duration);
      case 'synthesizer':
        return this.playSynthesizer(freq, duration);
      case 'kora':
        return this.playKora(freq, duration);
      case 'kalimba':
        return this.playKalimba(freq, duration);
      default:
        return this.playGuitarString(freq, duration);
    }
  }
}

export const audioEngine = new SoundEngine();
