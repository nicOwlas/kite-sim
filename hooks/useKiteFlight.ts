"use client";
import { useFrame } from "@react-three/fiber";
import { MathUtils, Group, Matrix4, Vector3 } from "three";
import { RefObject, useEffect, useRef } from "react";
import {
  sampleFlightPath,
  type FlightCenter,
  type FlightAmplitudes,
} from "@/utils/flightPath";
import traction, { tetherTension } from "@/utils/traction";
import { tetherSag } from "@/utils/tetherSag";
import {
  CATENARY_MAX_SAG_FRACTION,
  GRAVITY,
  POD_POSITION,
} from "@/utils/constants";
import { pushSample, type KiteTrailBuffer } from "@/utils/kiteTrail";
import type { KiteParameters, WindParameters } from "@/utils/types";

const DASHBOARD_HZ = 10;
const DASHBOARD_INTERVAL_S = 1 / DASHBOARD_HZ;
const PHI_INITIAL = 0;
const BOAT_FORWARD = new Vector3(1, 0, 0);

export interface KiteFlightReadout {
  propulsiveForceInstant: number;
  apparentWindMps: number;
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
  trailBufferRef?: RefObject<KiteTrailBuffer | null>;
  globalPhaseRef?: RefObject<number>;
  /** Written each frame with the tether's midspan sag (m) for the renderer. */
  sagRef?: RefObject<number>;
}

export function useKiteFlight(input: UseKiteFlightInput): void {
  const phiRef = useRef(PHI_INITIAL);
  const dashAccumRef = useRef(0);
  const podVec = useRef(new Vector3(...POD_POSITION));

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

    // Advance φ (wrapped) and the monotonic global phase (never resets).
    const dPhi = sample.dPhiDt * dt;
    phiRef.current = (phiRef.current + dPhi) % (2 * Math.PI);
    const globalPhaseRef = input.globalPhaseRef;
    if (globalPhaseRef) {
      globalPhaseRef.current = globalPhaseRef.current + dPhi;
    }

    // Position
    group.position.copy(sample.position);

    // Trail capture (after position is finalized for this frame).
    const trailBuffer = input.trailBufferRef?.current;
    if (trailBuffer && globalPhaseRef) {
      pushSample(trailBuffer, sample.position, globalPhaseRef.current);
    }

    // Tether direction (radialOut: from pod to kite, unit length).
    const tetherDirection = tetherDirRef.current
      .copy(sample.position)
      .sub(podVec.current);
    const tetherLen = tetherDirection.length();
    const sagRef = input.sagRef;
    if (tetherLen < 1e-6) {
      if (sagRef) sagRef.current = 0;
      return;
    }
    // Horizontal span (√(dx² + dz²)) — capture before normalizing in place.
    const horizontalSpan = Math.hypot(tetherDirection.x, tetherDirection.z);
    tetherDirection.multiplyScalar(1 / tetherLen);

    if (input.flying) {
      // Dynamic orientation: build the basis directly instead of
      // lookAt+Euler.z, which doesn't cleanly rotate about the tether axis
      // and causes 180° flips as the kite moves around the wind-window sphere.
      //
      //   local +Y = tangent     → model's leading edge, aimed along motion
      //   local +Z = -radialOut  → canopy "up" points away from pod, so the
      //                            canopy surface stays ⊥ tether & right-side-up
      //   local +X = +Y × +Z
      //
      // sample.tangent is unit length and ⊥ radialOut, so the basis is
      // orthonormal.
      if (sample.tangent.lengthSq() >= 1e-12) {
        const canopyAxis = canopyAxisRef.current.copy(tetherDirection).negate();
        const xAxis = xAxisRef.current.crossVectors(sample.tangent, canopyAxis);
        orientMatrixRef.current.makeBasis(xAxis, sample.tangent, canopyAxis);
        group.quaternion.setFromRotationMatrix(orientMatrixRef.current);
      }
    } else {
      // Static orientation: match the pre-dynamic-flight behavior so the
      // parked kite "looks at the sky" at azimuth=windDirection.
      group.lookAt(podVec.current);
      group.rotation.z =
        MathUtils.degToRad(input.windParameters.direction_deg) + Math.PI / 2;
    }

    // Tether catenary sag (visual): bow the line below the chord under its own
    // weight, scaled by the line tension. High pull → taut; parked → clamped droop.
    if (sagRef) {
      const tension = tetherTension(
        sample.apparentWindSpeed,
        input.kiteParameters,
      );
      sagRef.current = tetherSag({
        tension_N: tension,
        weightPerMeter_Npm: input.kiteParameters.tetherWeight_kgpm * GRAVITY,
        horizontalSpan_m: horizontalSpan,
        chordLength_m: tetherLen,
        maxSagFraction: CATENARY_MAX_SAG_FRACTION,
      });
    }

    // Traction
    const instant = traction({
      apparentWindSpeed: sample.apparentWindSpeed,
      tetherDirection,
      boatForward: BOAT_FORWARD,
      kiteParameters: input.kiteParameters,
    });

    // Throttled dashboard update
    dashAccumRef.current += dt;
    if (dashAccumRef.current >= DASHBOARD_INTERVAL_S) {
      dashAccumRef.current = 0;
      onReadout({
        propulsiveForceInstant: Math.round(instant),
        apparentWindMps: Math.round(sample.apparentWindSpeed * 10) / 10,
        kiteElevationDeg: Math.round(MathUtils.radToDeg(sample.elevation)),
        kiteAltitudeM: Math.round(sample.position.y),
      });
    }
  });
}
