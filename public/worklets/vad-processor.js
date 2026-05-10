/**
 * Production-grade VAD Processor
 * Measures RMS (Root Mean Square) energy of audio chunks to detect voice activity.
 */
class VADProcessor extends AudioWorkletProcessor {
  private threshold = 0.015;
  private silenceFrames = 0;
  private maxSilenceFrames = 50; // ~1.5s at 128 samples per frame
  private isSpeaking = false;

  process(inputs: Float32Array[][], outputs: Float32Array[][]) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channel = input[0];
    let sumSquares = 0;
    for (let i = 0; i < channel.length; i++) {
      sumSquares += channel[i] * channel[i];
    }
    const rms = Math.sqrt(sumSquares / channel.length);

    if (rms > this.threshold) {
      if (!this.isSpeaking) {
        this.isSpeaking = true;
        this.port.postMessage({ type: "SPEECH_START" });
      }
      this.silenceFrames = 0;
    } else {
      if (this.isSpeaking) {
        this.silenceFrames++;
        if (this.silenceFrames > this.maxSilenceFrames) {
          this.isSpeaking = false;
          this.port.postMessage({ type: "SPEECH_END" });
        }
      }
    }

    return true;
  }
}

registerProcessor("vad-processor", VADProcessor);
