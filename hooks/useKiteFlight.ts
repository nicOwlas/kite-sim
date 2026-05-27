"use client";
import { useFrame } from "@react-three/fiber";
import { MathUtils, Group, Matrix4, Vector3 } from "three";
import { RefObject, useEffect, useRef } from "react";
import {
  sampleFlightPath,
  type FlightCenter,
  type FlightAmplitudes,
} from "@/utils/flightPath";
import traction from "@/utils/traction";
import { POD_POSITION } from "@/utils/constants";
import type { KiteParameters, WindParameters } from "@/utils/types";

const DASHBOARD_HZ = 10;
const DASHBOARD_INTERVAL_S = 1 / DASHBOARD_HZ;
const AVERAGE_WINDOW_S = 1.0;
const PHI_INITIAL = 0;
const BOAT_FORWARD = new Vector3(1, 0, 0);

export interface KiteFlightReadout {
  propulsiveForceInstant: number;
  propulsiveForceAvg: number;
  kiteElevationDeg: number;
  kiteAltitudeM: number;
}

interface UseKiteFlightInput {
  kiteRef: RefObject<Group | null>;
  center: FlightCenter;
  amplitudes: FlightAmplitudes;
  kiteParameters: KiteParameters;
  windParameters: WindParameters;
  flying: boolean;
  onReadout: (r: KiteFlightReadout) => void;
}

export function useKiteFlight(input: UseKiteFlightInput): void {
  const phiRef = useRef(PHI_INITIAL);
  const dashAccumRef = useRef(0);
  const podVec = useRef(new Vector3(...POD_POSITION));

  // Ring buffer for rolling 1 s average of instantaneous force.
  const bufferRef = useRef<{ value: number; t: number }[]>([]);
  const elapsedRef = useRef(0);

  const tetherDirRef = useRef(new Vector3());
  const canopyAxisRef = useRef(new Vector3());
  const xAxisRef = useRef(new Vector3());
  const orientMatrixRef = useRef(new Matrix4());

  // Reset φ when the center moves discontinuously (envelope click) — keeps the
  // figure-8 visually anchored when the user re-targets.
  const centerKey = `${input.center.azimuth.toFixed(4)}_${input.center.elevation.toFixed(4)}`;
  useEffect(() => {
    phiRef.current = PHI_INITIAL;
  }, [centerKey]);

  const onReadout = input.onReadout;

  useFrame((_state, delta) => {
    const group = input.kiteRef.current;
    if (!group) return;
    // Guard against huge delta jumps (tab refocus etc.)
    const dt = Math.min(delta, 0.1);

    const sample = sampleFlightPath({
      phi: phiRef.current,
      center: input.center,
      amplitudes: input.amplitudes,
      kiteParameters: input.kiteParameters,
      windParameters: input.windParameters,
      flying: input.flying,
    });

    // Advance φ
    phiRef.current = (phiRef.current + sample.dPhiDt * dt) % (2 * Math.PI);

    // Position
    group.position.copy(sample.position);

    // Tether direction (radialOut: from pod to kite, unit length).
    const tetherDirection = tetherDirRef.current
      .copy(sample.position)
      .sub(podVec.current);
    const tetherLen = tetherDirection.length();
    if (tetherLen < 1e-6) return;
    tetherDirection.multiplyScalar(1 / tetherLen);

    // Orientation: build the basis directly instead of lookAt+Euler.z, which
    // doesn't cleanly rotate about the tether axis and causes 180° flips as
    // the kite moves around the wind-window sphere.
    //
    //   local +Y = tangent     → model's local +Y is the leading edge, so we
    //                            aim it along motion
    //   local +Z = -radialOut  → model's "canopy up" is local -Z, so we point
    //                            -Z away from the pod; canopy surface stays
    //                            ⊥ tether and right-side-up
    //   local +X = +Y × +Z = tangent × (-radialOut)
    //
    // sample.tangent is unit length and ⊥ radialOut (both lie on the
    // wind-sphere tangent plane), so this basis is orthonormal.
    if (sample.tangent.lengthSq() >= 1e-12) {
      const canopyAxis = canopyAxisRef.current.copy(tetherDirection).negate();
      const xAxis = xAxisRef.current.crossVectors(sample.tangent, canopyAxis);
      orientMatrixRef.current.makeBasis(xAxis, sample.tangent, canopyAxis);
      group.quaternion.setFromRotationMatrix(orientMatrixRef.current);
    }

    // Traction
    const instant = traction({
      apparentWindSpeed: sample.apparentWindSpeed,
      tetherDirection,
      boatForward: BOAT_FORWARD,
      kiteParameters: input.kiteParameters,
    });

    // Rolling average
    elapsedRef.current += dt;
    const buffer = bufferRef.current;
    buffer.push({ value: instant, t: elapsedRef.current });
    const cutoff = elapsedRef.current - AVERAGE_WINDOW_S;
    while (buffer.length > 0 && buffer[0].t < cutoff) buffer.shift();
    const avg =
      buffer.length === 0
        ? 0
        : buffer.reduce((s, x) => s + x.value, 0) / buffer.length;

    // Throttled dashboard update
    dashAccumRef.current += dt;
    if (dashAccumRef.current >= DASHBOARD_INTERVAL_S) {
      dashAccumRef.current = 0;
      onReadout({
        propulsiveForceInstant: Math.round(instant),
        propulsiveForceAvg: Math.round(avg),
        kiteElevationDeg: Math.round(MathUtils.radToDeg(sample.elevation)),
        kiteAltitudeM: Math.round(sample.position.y),
      });
    }
  });
}
