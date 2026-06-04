import { describe, expect, it } from "vitest";
import { tetherSag, type TetherSagInput } from "./tetherSag";

function makeInput(overrides: Partial<TetherSagInput> = {}): TetherSagInput {
  return {
    tension_N: 100_000,
    weightPerMeter_Npm: 1.5 * 9.81,
    horizontalSpan_m: 200,
    chordLength_m: 300,
    maxSagFraction: 0.25,
    ...overrides,
  };
}

describe("tetherSag", () => {
  it("is zero when the kite is directly overhead (no horizontal span)", () => {
    expect(tetherSag(makeInput({ horizontalSpan_m: 0 }))).toBe(0);
  });

  it("is zero for a degenerate (zero-length) chord", () => {
    expect(tetherSag(makeInput({ chordLength_m: 0 }))).toBe(0);
  });

  it("increases with line weight", () => {
    const light = tetherSag(makeInput({ weightPerMeter_Npm: 5 }));
    const heavy = tetherSag(makeInput({ weightPerMeter_Npm: 50 }));
    expect(heavy).toBeGreaterThan(light);
  });

  it("decreases as tension increases", () => {
    const slack = tetherSag(makeInput({ tension_N: 20_000 }));
    const taut = tetherSag(makeInput({ tension_N: 500_000 }));
    expect(taut).toBeLessThan(slack);
  });

  it("clamps to maxSagFraction · chordLength as tension → 0", () => {
    const input = makeInput({ tension_N: 1e-9 });
    const expectedMax = input.maxSagFraction * input.chordLength_m;
    expect(tetherSag(input)).toBeCloseTo(expectedMax, 6);
  });

  it("never exceeds the clamp, even with a heavy line and low tension", () => {
    const input = makeInput({ tension_N: 100, weightPerMeter_Npm: 1000 });
    const max = input.maxSagFraction * input.chordLength_m;
    expect(tetherSag(input)).toBeLessThanOrEqual(max);
  });

  it("returns the clamped max (not NaN/Infinity) for non-positive tension", () => {
    const input = makeInput({ tension_N: 0 });
    const max = input.maxSagFraction * input.chordLength_m;
    const result = tetherSag(input);
    expect(Number.isFinite(result)).toBe(true);
    expect(result).toBe(max);
  });

  it("matches the parabola formula d = w·ℓh²/(8·H) below the clamp", () => {
    // Choose parameters that stay below the clamp so the formula is exercised.
    const input = makeInput({
      tension_N: 1_000_000,
      weightPerMeter_Npm: 10,
      horizontalSpan_m: 100,
      chordLength_m: 200,
    });
    const H = input.tension_N * (input.horizontalSpan_m / input.chordLength_m);
    const expected =
      (input.weightPerMeter_Npm * input.horizontalSpan_m ** 2) / (8 * H);
    expect(tetherSag(input)).toBeCloseTo(expected, 6);
    expect(expected).toBeLessThan(input.maxSagFraction * input.chordLength_m);
  });
});
