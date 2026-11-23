import { AudioPlayer, createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type SoundCue = 'tick' | 'tap' | 'success' | 'pop';

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;
  private hapticsEnabled = true;
  private players: Partial<Record<SoundCue, AudioPlayer>> = {};

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setHapticsEnabled(enabled: boolean) {
    this.hapticsEnabled = enabled;
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(error => console.warn('Unable to resume audio context:', error));
    }
  }

  private playNative(cue: SoundCue) {
    try {
      let player = this.players[cue];
      if (!player) {
        const source = {
          tick: require('../../assets/audio/tick.wav'),
          tap: require('../../assets/audio/tap.wav'),
          success: require('../../assets/audio/success.wav'),
          pop: require('../../assets/audio/pop.wav')
        }[cue];
        player = createAudioPlayer(source, { updateInterval: 1000 });
        player.volume = 0.35;
        this.players[cue] = player;
      }

      if (player.playing) return;
      if (player.isLoaded) {
        void player.seekTo(0).then(() => player.play()).catch(error => {
          console.warn(`Unable to play ${cue} sound:`, error);
        });
      } else {
        player.play();
      }
    } catch (error) {
      console.warn(`Unable to initialize ${cue} sound:`, error);
    }
  }

  private playWebTone(
    frequency: number,
    endFrequency: number,
    type: OscillatorType,
    duration: number,
    volume: number
  ) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + duration);
    } catch (error) {
      console.warn('Unable to play sound:', error);
    }
  }

  public playTick() {
    if (!this.soundEnabled) return;
    if (Platform.OS !== 'web') {
      this.playNative('tick');
      return;
    }
    this.playWebTone(680, 220, 'sine', 0.025, 0.04);
  }

  public playTap() {
    if (!this.soundEnabled) return;
    if (Platform.OS !== 'web') {
      this.playNative('tap');
      return;
    }
    this.playWebTone(440, 180, 'triangle', 0.04, 0.05);
  }

  public playSuccess() {
    if (!this.soundEnabled) return;
    if (Platform.OS !== 'web') {
      this.playNative('success');
      return;
    }

    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
        if (!this.ctx) return;
        const startTime = now + index * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.05, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });
    } catch (error) {
      console.warn('Unable to play success sound:', error);
    }
  }

  public playPop() {
    if (!this.soundEnabled) return;
    if (Platform.OS !== 'web') {
      this.playNative('pop');
      return;
    }
    this.playWebTone(320, 580, 'sine', 0.06, 0.06);
  }

  public triggerVibrate(pattern: number | number[] = 15) {
    if (!this.hapticsEnabled) return;

    const feedback = Array.isArray(pattern)
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : pattern <= 10
        ? Haptics.selectionAsync()
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void feedback.catch(error => console.warn('Unable to trigger haptics:', error));
  }

  public dispose() {
    Object.values(this.players).forEach(player => player?.release());
    this.players = {};
    if (this.ctx) {
      void this.ctx.close().catch(error => console.warn('Unable to close audio context:', error));
      this.ctx = null;
    }
  }
}

export const sound = new SoundManager();
