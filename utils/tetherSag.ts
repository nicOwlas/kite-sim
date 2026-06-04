export interface TetherSagInput {
  /** Line tension along the tether, in newtons (always ≥ 0). */
  tension_N: number;
  /** Line weight per metre, in N/m (linear density × g). */
  weightPerMeter_Npm: number;
  /** Horizontal distance between the endpoints (√(dx² + dz²)), in metres. */
  horizontalSpan_m: number;
  /** Straight-line distance between the endpoints (the chord), in metres. */
  chordLength_m: number;
  /** Max midspan sag as a fraction of the chord length (clamp for low tension). */
  maxSagFraction: number;
}

/**
 * Midspan sag of the tether modelled as a parabola (the shallow-cable
 * approximation of a catenary), measured vertically below the chord.
 *
 *   H = T · (ℓh / chord)            horizontal component of the line tension
 *   d = w · ℓh² / (8 · H)           parabolic sag below the chord at midspan
 *
 * Using the *horizontal* span ℓh means an overhead/zenith line (ℓh → 0) renders
 * nearly straight while a low, downwind line sags. As tension → 0 (parked / low
 * wind) the formula diverges, so the result is clamped to
 * `maxSagFraction · chordLength`.
 *
 * Returns 0 for a degenerate (zero-length) chord, and the clamped maximum for a
 * non-positive tension — never NaN or Infinity.
 */
export function tetherSag(input: TetherSagInput): number {
  const {
    tension_N,
    weightPerMeter_Npm,
    horizontalSpan_m,
    chordLength_m,
    maxSagFraction,
  } = input;

  if (chordLength_m <= 0) return 0;

  const maxSag = maxSagFraction * chordLength_m;

  // Non-positive tension (or no horizontal span) → fall back to the clamp.
  if (tension_N <= 0) return maxSag;

  const horizontalTension = tension_N * (horizontalSpan_m / chordLength_m);
  if (horizontalTension <= 0) return 0;

  const sag =
    (weightPerMeter_Npm * horizontalSpan_m * horizontalSpan_m) /
    (8 * horizontalTension);

  return Math.min(sag, maxSag);
}

export default tetherSag;
