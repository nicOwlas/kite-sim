import { describe, expect, it } from "vitest";
import traction from "./traction";

function makeProps(overrides = {}) {
  return {
    kiteAttitude: {
      radius: 150,
      azimuth: 0,
      elevation: Math.PI / 12,
      roll: 0,
      pitch: 0,
      yaw: 0,
    },
    kiteParameters: {
      length_m: 150,
      surface_m2: 400,
      liftToDrag: 6,
    },
    windParameters: {
      speed_kt: 20,
      direction_deg: 0,
    },
    ...overrides,
  };
}

describe("traction", () => {
  it("returns a number", () => {
    const result = traction(makeProps());
    expect(typeof result).toBe("number");
  });

  it("returns positive force when kite is aligned with wind", () => {
    const result = traction(makeProps());
    expect(result).toBeGreaterThan(0);
  });

  it("returns zero force when wind speed is zero", () => {
    const result = traction(
      makeProps({
        windParameters: { speed_kt: 0, direction_deg: 0 },
      })
    );
    expect(result).toBe(0);
  });

  it("increases force with higher wind speed", () => {
    const low = traction(
      makeProps({
        windParameters: { speed_kt: 10, direction_deg: 0 },
      })
    );
    const high = traction(
      makeProps({
        windParameters: { speed_kt: 30, direction_deg: 0 },
      })
    );
    expect(high).toBeGreaterThan(low);
  });

  it("increases force with larger kite surface", () => {
    const small = traction(
      makeProps({
        kiteParameters: { length_m: 150, surface_m2: 100, liftToDrag: 6 },
      })
    );
    const large = traction(
      makeProps({
        kiteParameters: { length_m: 150, surface_m2: 800, liftToDrag: 6 },
      })
    );
    expect(large).toBeGreaterThan(small);
  });

  it("returns lower force when kite azimuth is perpendicular to wind", () => {
    const aligned = traction(makeProps());
    const perpendicular = traction(
      makeProps({
        kiteAttitude: {
          radius: 150,
          azimuth: Math.PI / 2,
          elevation: Math.PI / 12,
          roll: 0,
          pitch: 0,
          yaw: 0,
        },
      })
    );
    expect(aligned).toBeGreaterThan(perpendicular);
  });

  it("returns higher force at higher elevation (stronger wind gradient)", () => {
    const lowElevation = traction(
      makeProps({
        kiteAttitude: {
          radius: 150,
          azimuth: 0,
          elevation: Math.PI / 36, // 5 degrees
          roll: 0,
          pitch: 0,
          yaw: 0,
        },
      })
    );
    const highElevation = traction(
      makeProps({
        kiteAttitude: {
          radius: 150,
          azimuth: 0,
          elevation: Math.PI / 4, // 45 degrees
          roll: 0,
          pitch: 0,
          yaw: 0,
        },
      })
    );
    expect(highElevation).toBeGreaterThan(lowElevation);
  });

  it("returns an integer (rounded value)", () => {
    const result = traction(makeProps());
    expect(result).toBe(Math.round(result));
  });

  it("handles wind from opposite direction", () => {
    const aligned = traction(makeProps());
    const opposite = traction(
      makeProps({
        windParameters: { speed_kt: 20, direction_deg: 180 },
      })
    );
    // Wind from 180 with kite at azimuth 0 still produces positive force
    // (wind pushes kite from behind), but magnitude differs from aligned case
    expect(opposite).toBeGreaterThan(0);
    expect(typeof opposite).toBe("number");
  });

  it("scales quadratically with wind speed", () => {
    const base = traction(
      makeProps({
        windParameters: { speed_kt: 10, direction_deg: 0 },
      })
    );
    const doubled = traction(
      makeProps({
        windParameters: { speed_kt: 20, direction_deg: 0 },
      })
    );
    // Force ~ V^2, so doubling wind should ~4x force
    const ratio = doubled / base;
    expect(ratio).toBeGreaterThan(3.5);
    expect(ratio).toBeLessThan(4.5);
  });
});
