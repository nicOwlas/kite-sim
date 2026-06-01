import { Vector3 } from "three";

export interface KiteTrailSample {
  position: Vector3;
  globalPhase: number;
  filled: boolean;
}

export interface KiteTrailBuffer {
  samples: KiteTrailSample[];
  head: number;
  capacity: number;
}

// Capacity covers ≥1 cycle (2π) at 60 fps for cycle periods up to ~17s.
const DEFAULT_CAPACITY = 1024;

export function createTrailBuffer(
  capacity: number = DEFAULT_CAPACITY,
): KiteTrailBuffer {
  const samples: KiteTrailSample[] = [];
  for (let i = 0; i < capacity; i++) {
    samples.push({ position: new Vector3(), globalPhase: 0, filled: false });
  }
  return { samples, head: 0, capacity };
}

export function pushSample(
  buf: KiteTrailBuffer,
  position: Vector3,
  globalPhase: number,
): void {
  const slot = buf.samples[buf.head];
  slot.position.copy(position);
  slot.globalPhase = globalPhase;
  slot.filled = true;
  buf.head = (buf.head + 1) % buf.capacity;
}

// Walks oldest→newest, returning slots whose phase-age is within `maxAge`.
// Mutates and returns `out`. Aliases buffer slots — do not retain across frames.
export function collectActive(
  buf: KiteTrailBuffer,
  currentGlobalPhase: number,
  maxAge: number,
  out: KiteTrailSample[],
): KiteTrailSample[] {
  out.length = 0;
  for (let i = 0; i < buf.capacity; i++) {
    const idx = (buf.head + i) % buf.capacity;
    const slot = buf.samples[idx];
    if (!slot.filled) continue;
    const age = currentGlobalPhase - slot.globalPhase;
    if (age >= 0 && age <= maxAge) out.push(slot);
  }
  return out;
}
