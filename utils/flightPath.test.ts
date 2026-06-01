import { describe, expect, it } from "vitest";
import { MathUtils } from "three";
import { sampleFlightPath } from "./flightPath";
import { POD_POSITION } from "./constants";
import type { KiteParameters, WindParameters } from "./types";

const { degToRad } = MathUtils;

const kiteParameters: KiteParameters = {
  length_m: 150,
  surface_m2: 400,
  liftToDrag: 6,
};

const windParameters: WindParameters = {
  speed_kt: 20,
  direction_deg: 0,
};

const defaults = {
  center: { azimuth: 0, elevation: degToRad(20) },
  amplitudes: { azimuth: degToRad(30), elevation: degToRad(10) },
  kiteParameters,
  windParameters,
  flying: true,
};

describe("sampleFlightPath", () => {
  it("closes the path: position at φ = 0 equals position at φ = 2π", () => {
    const a = sampleFlightPath({ ...defaults, phi: 0 });
    const b = sampleFlightPath({ ...defaults, phi: 2 * Math.PI });
    expect(a.position.distanceTo(b.position)).toBeLessThan(1e-6);
    expect(Math.abs(a.azimuth - b.azimuth)).toBeLessThan(1e-9);
    expect(Math.abs(a.elevation - b.elevation)).toBeLessThan(1e-9);
  });

  it("tangent at the central crossing (φ = 0) advances azimuth and elevation positively", () => {
    const s = sampleFlightPath({ ...defaults, phi: 0 });
    // At φ = 0, az'(0) = +A and el'(0) = +B, so the velocity in the
    // sphere-tangent plane points in the +azimuth (+z world) and +elevation
    // (+y world) directions.
    expect(s.tangent.z).toBeGreaterThan(0);
    expect(s.tangent.y).toBeGreaterThan(0);
  });

  it("signed curvature changes sign across one half-loop", () => {
    // The Gerono figure-8 swaps banking direction inside each lobe.
    const samples = Array.from({ length: 40 }, (_, i) =>
      sampleFlightPath({
        ...defaults,
        phi: (i / 40) * 2 * Math.PI,
      }),
    );
    const hasPositive = samples.some((s) => s.curvature > 1e-6);
    const hasNegative = samples.some((s) => s.curvature < -1e-6);
    expect(hasPositive).toBe(true);
    expect(hasNegative).toBe(true);
  });

  it("kite speed peaks near the downwind crossing", () => {
    // With center at the downwind direction, the central crossings (φ = 0, π)
    // hit cos(θ_downwind) ≈ 1 → fastest. The lemniscate edges (φ = π/2, 3π/2)
    // are off-center in azimuth → slower.
    const center = sampleFlightPath({ ...defaults, phi: 0 });
    const edge = sampleFlightPath({ ...defaults, phi: Math.PI / 2 });
    expect(center.speed).toBeGreaterThan(edge.speed);
  });

  it("flying = false freezes the kite (zero speed, apparent wind = true wind)", () => {
    const parked = sampleFlightPath({ ...defaults, phi: 1.2, flying: false });
    expect(parked.speed).toBe(0);
    expect(parked.velocity.length()).toBe(0);
    expect(parked.apparentWind.distanceTo(parked.windAtKite)).toBeLessThan(
      1e-9,
    );
  });

  it("zero wind speed yields zero kite speed and zero apparent wind", () => {
    const s = sampleFlightPath({
      ...defaults,
      phi: 0.3,
      windParameters: { speed_kt: 0, direction_deg: 0 },
    });
    expect(s.speed).toBe(0);
    expect(s.apparentWindSpeed).toBe(0);
  });

  it("reorients the path when the wind direction changes", () => {
    const eastWind = sampleFlightPath({
      ...defaults,
      phi: 0,
      center: { azimuth: 0, elevation: degToRad(20) },
      windParameters: { speed_kt: 20, direction_deg: 0 },
    });
    const sideWind = sampleFlightPath({
      ...defaults,
      phi: 0,
      center: { azimuth: degToRad(90), elevation: degToRad(20) },
      windParameters: { speed_kt: 20, direction_deg: 90 },
    });
    // Same relative geometry, rotated 90° in world coords around the pod:
    // the east-wind kite's downwind offset (+X from pod) should match the
    // side-wind kite's lateral offset (+Z from pod).
    const eastOffset = eastWind.position.x - POD_POSITION[0];
    const sideOffset = sideWind.position.z - POD_POSITION[2];
    expect(Math.abs(eastOffset - sideOffset)).toBeLessThan(1e-6);
  });
});
