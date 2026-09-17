import type { GameEvent } from "./types";
/** Original synthesized material cues. No external recordings or hidden state. */
export class TableAudio {
  private context: AudioContext | null = null;
  private played = 0;
  private voices = 0;
  private lastWarning = 0;
  effects = 0.35;
  music = 0;
  unlock() {
    this.context ??= new AudioContext();
    void this.context.resume();
  }
  resumeAt(sequence: number) {
    this.played = sequence;
  }
  play(events: GameEvent[]) {
    for (const e of events) {
      if (e.seq <= this.played) continue;
      this.played = e.seq;
      if (!this.context || this.effects <= 0 || this.voices >= 2) continue;
      if (
        ![
          "NobleBuilt",
          "NobleCommitted",
          "NobleTransferred",
          "MarriageFormed",
          "CrownProclaimed",
          "HeirInstalled",
          "PaintingCompleted",
          "DynastySettled",
          "InterregnumActivated",
          "FragmentVeiled",
        ].includes(e.type)
      )
        continue;
      const ctx = this.context;
      const ceremonial = [
        "MarriageFormed",
        "CrownProclaimed",
        "HeirInstalled",
        "DynastySettled",
      ].includes(e.type);
      const osc = ctx.createOscillator(),
        gain = ctx.createGain();
      osc.type = ceremonial ? "sine" : "triangle";
      osc.frequency.setValueAtTime(ceremonial ? 392 : 160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        ceremonial ? 523 : 70,
        ctx.currentTime + 0.18,
      );
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        this.effects * 0.12,
        ctx.currentTime + 0.012,
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.24);
      osc.connect(gain).connect(ctx.destination);
      this.voices++;
      osc.onended = () => {
        this.voices--;
        osc.disconnect();
        gain.disconnect();
      };
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  }
  close() {
    void this.context?.close();
    this.context = null;
  }
}
