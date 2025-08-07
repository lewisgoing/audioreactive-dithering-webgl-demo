
export class AudioProcessor {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;
  private source: MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null = null;

  constructor() {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256; // More detail
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  private async resumeContext() {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  public async initializeWithFile(audioElement: HTMLAudioElement) {
    await this.resumeContext();
    if (this.source) {
      this.source.disconnect();
    }
    this.source = this.audioContext.createMediaElementSource(audioElement);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
    audioElement.play();
  }

  private getFrequencyRange(start: number, end: number): number {
    if (!this.source) {
      return 0;
    }
    const range = this.dataArray.slice(start, end);
    const sum = range.reduce((a, b) => a + b, 0);
    return sum / range.length / 255; // Normalize
  }

  public getAudioData() {
    if (!this.source) {
      return { bass: 0, mid: 0, high: 0 };
    }
    this.analyser.getByteFrequencyData(this.dataArray);
    const bass = this.getFrequencyRange(1, 5);
    const mid = this.getFrequencyRange(6, 50);
    const high = this.getFrequencyRange(51, 128);
    return { bass, mid, high };
  }
}
