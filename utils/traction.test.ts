import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import traction from "./traction";
import {
  KNOTS_TO_MS,
  MIN_KITE_HEIGHT,
  REFERENCE_HEIGHT,
  WIND_GRADIENT_EXPONENT,
} from "./constants";

type LegacyProps = {
  kiteAttitude: {
    radius: number;
    azimuth: number;
    elevation: number;
    roll: number;
    pitch: number;
    yaw: number;
  };
  kiteParameters: { length_m: number; surface_m2: number; liftToDrag: number };
  windParameters: { speed_kt: number; direction_deg: number };
};

function makeLegacy(overrides: Partial<LegacyProps> = {}): LegacyProps {
  const base: LegacyProps = {
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
  };
  return {
    ...base,
    ...overrides,
    kiteAttitude: { ...base.kiteAttitude, ...(overrides.kiteAttitude ?? {}) },
    kiteParameters: {
      ...base.kiteParameters,
      ...(overrides.kiteParameters ?? {}),
    },
    windParameters: {
      ...base.windParameters,
      ...(overrides.windParameters ?? {}),
    },
  };
}

/** Build the new traction signature from a legacy static (v_kite = 0) scenario. */
function staticProps(legacy: LegacyProps) {
  const { radius, azimuth, elevation } = legacy.kiteAttitude;
  const windSpeed = legacy.windParameters.speed_kt * KNOTS_TO_MS;
  const kiteHeight = Math.sin(elevation) * radius + MIN_KITE_HEIGHT;
  const windScale = (kiteHeight / REFERENCE_HEIGHT) ** WIND_GRADIENT_EXPONENT;
  const apparentWindSpeed = windSpeed * windScale;
  const tetherDirection = new Vector3(
    Math.cos(elevation) * Math.cos(azimuth),
    Math.sin(elevation),
    Math.cos(elevation) * Math.sin(azimuth),
  );
  const boatForward = new Vector3(1, 0, 0);
  return {
    apparentWindSpeed,
    tetherDirection,
    boatForward,
    kiteParameters: legacy.kiteParameters,
  };
}

function tractionStatic(overrides: Partial<LegacyProps> = {}) {
  return traction(staticProps(makeLegacy(overrides)));
}

describe("traction (static, v_kite = 0)", () => {
  it("returns a number", () => {
    expect(typeof tractionStatic()).toBe("number");
  });

  it("returns positive force when kite is aligned with boat forward", () => {
    expect(tractionStatic()).toBeGreaterThan(0);
  });

  it("returns zero force when wind speed is zero", () => {
    expect(
      tractionStatic({ windParameters: { speed_kt: 0, direction_deg: 0 } }),
    ).toBe(0);
  });

  it("increases force with higher wind speed", () => {
    const low = tractionStatic({
      windParameters: { speed_kt: 10, direction_deg: 0 },
    });
    const high = tractionStatic({
      windParameters: { speed_kt: 30, direction_deg: 0 },
    });
    expect(high).toBeGreaterThan(low);
  });

  it("increases force with larger kite surface", () => {
    const small = tractionStatic({
      kiteParameters: { length_m: 150, surface_m2: 100, liftToDrag: 6 },
    });
    const large = tractionStatic({
      kiteParameters: { length_m: 150, surface_m2: 800, liftToDrag: 6 },
    });
    expect(large).toBeGreaterThan(small);
  });

  it("returns lower force when kite azimuth is perpendicular to boat forward", () => {
    const aligned = tractionStatic();
    const perpendicular = tractionStatic({
      kiteAttitude: {
        radius: 150,
        azimuth: Math.PI / 2,
        elevation: Math.PI / 12,
        roll: 0,
        pitch: 0,
        yaw: 0,
      },
    });
    expect(aligned).toBeGreaterThan(perpendicular);
  });

  it("returns higher force at higher elevation (stronger wind gradient)", () => {
    const lowElevation = tractionStatic({
      kiteAttitude: {
        radius: 150,
        azimuth: 0,
        elevation: Math.PI / 36,
        roll: 0,
        pitch: 0,
        yaw: 0,
      },
    });
    const highElevation = tractionStatic({
      kiteAttitude: {
        radius: 150,
        azimuth: 0,
        elevation: Math.PI / 4,
        roll: 0,
        pitch: 0,
        yaw: 0,
      },
    });
    expect(highElevation).toBeGreaterThan(lowElevation);
  });

  it("returns an integer (rounded value)", () => {
    const result = tractionStatic();
    expect(result).toBe(Math.round(result));
  });

  it("static apparent wind magnitude is direction-independent", () => {
    // With v_kite = 0, only wind speed (not direction) drives apparent wind magnitude.
    const aligned = tractionStatic();
    const opposite = tractionStatic({
      windParameters: { speed_kt: 20, direction_deg: 180 },
    });
    expect(opposite).toBe(aligned);
  });

  it("scales quadratically with apparent wind speed", () => {
    const base = tractionStatic({
      windParameters: { speed_kt: 10, direction_deg: 0 },
    });
    const doubled = tractionStatic({
      windParameters: { speed_kt: 20, direction_deg: 0 },
    });
    const ratio = doubled / base;
    expect(ratio).toBeGreaterThan(3.5);
    expect(ratio).toBeLessThan(4.5);
  });
});

describe("Loyd cross-wind amplification", () => {
  it("traction at v_kite = V_wind · (L/D) perpendicular to wind is ~(L/D)² × static", () => {
    const LD = 6;
    const surface = 400;
    const windSpeed = 10; // m/s, no gradient applied in this synthetic comparison
    const kiteParameters = {
      length_m: 150,
      surface_m2: surface,
      liftToDrag: LD,
    };

    // Static: kite at center of wind window, tether along boat forward, v_kite = 0
    const tetherDir = new Vector3(1, 0, 0);
    const boatForward = new Vector3(1, 0, 0);
    const staticForce = traction({
      apparentWindSpeed: windSpeed,
      tetherDirection: tetherDir,
      boatForward,
      kiteParameters,
    });

    // Cross-wind: kite at center, flying perpendicular to wind at v = V · L/D
    // Wind blows along +X with magnitude V; kite velocity along +Z with magnitude V·L/D.
    // |V_app|² = V² + (V·L/D)² = V² · (1 + (L/D)²)
    const apparentWindSpeed = windSpeed * Math.sqrt(1 + LD * LD);
    const crossWindForce = traction({
      apparentWindSpeed,
      tetherDirection: tetherDir,
      boatForward,
      kiteParameters,
    });

    const ratio = crossWindForce / staticForce;
    // Loyd: amplification ≈ (L/D)² (here exactly 1 + (L/D)² since speeds enter as squares).
    expect(ratio).toBeGreaterThan(LD * LD * 0.95);
    expect(ratio).toBeLessThan((1 + LD * LD) * 1.05);
  });
});
