import { MathUtils, Vector3 } from "three";
import {
  KNOTS_TO_MS,
  MIN_KITE_HEIGHT,
  POD_POSITION,
  REFERENCE_HEIGHT,
  WIND_GRADIENT_EXPONENT,
} from "./constants";
import type { KiteParameters, WindParameters } from "./types";

const { degToRad } = MathUtils;
const HALF_PI = Math.PI / 2;

export interface FlightCenter {
  azimuth: number;
  elevation: number;
}

export interface FlightAmplitudes {
  azimuth: number;
  elevation: number;
}

export interface FlightInput {
  phi: number;
  center: FlightCenter;
  amplitudes: FlightAmplitudes;
  kiteParameters: KiteParameters;
  windParameters: WindParameters;
  flying: boolean;
}

export interface FlightSample {
  azimuth: number;
  elevation: number;
  position: Vector3;
  velocity: Vector3;
  tangent: Vector3;
  speed: number;
  curvature: number;
  apparentWind: Vector3;
  apparentWindSpeed: number;
  windAtKite: Vector3;
  dPhiDt: number;
}

const podVec = new Vector3(...POD_POSITION);

/** Clamp the figure-8 amplitudes so the path stays inside the wind window. */
function clampAmplitudes(
  center: FlightCenter,
  amplitudes: FlightAmplitudes,
  windDirection: number,
): FlightAmplitudes {
  const margin = 0.005;
  const azMin = windDirection - HALF_PI + margin;
  const azMax = windDirection + HALF_PI - margin;
  const elMin = margin;
  const elMax = HALF_PI - margin;
  const azHeadroom = Math.min(center.azimuth - azMin, azMax - center.azimuth);
  const elHeadroom = Math.min(
    center.elevation - elMin,
    elMax - center.elevation,
  );
  return {
    azimuth: Math.max(0, Math.min(amplitudes.azimuth, azHeadroom)),
    elevation: Math.max(0, Math.min(amplitudes.elevation, elHeadroom)),
  };
}

/**
 * Gerono lemniscate on the wind-window sphere. Stateless — caller persists `phi`.
 * Speed follows the Loyd cross-wind approximation:
 *   v_kite ≈ V_wind_at_kite · (L/D) · cos(θ_downwind)
 * Apparent wind: V_wind − V_kite.
 */
export function sampleFlightPath(input: FlightInput): FlightSample {
  const { phi, center, kiteParameters, windParameters, flying } = input;
  const L = kiteParameters.length_m;
  const LD = Math.max(kiteParameters.liftToDrag, 0.0001);
  const windDirection = degToRad(windParameters.direction_deg);
  const windSpeedDeck = windParameters.speed_kt * KNOTS_TO_MS;

  const { azimuth: A, elevation: B } = clampAmplitudes(
    center,
    input.amplitudes,
    windDirection,
  );

  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const sin2Phi = Math.sin(2 * phi);
  const cos2Phi = Math.cos(2 * phi);

  const az = center.azimuth + A * sinPhi;
  const el = center.elevation + (B * sin2Phi) / 2;

  // d/dφ and d²/dφ² of (az, el)
  const azDot = A * cosPhi;
  const elDot = B * cos2Phi;
  const azDotDot = -A * sinPhi;
  const elDotDot = -2 * B * sin2Phi;

  const cAz = Math.cos(az);
  const sAz = Math.sin(az);
  const cEl = Math.cos(el);
  const sEl = Math.sin(el);

  // Position on sphere (in world coords, offset by pod)
  const position = new Vector3(
    L * cEl * cAz + podVec.x,
    L * sEl + podVec.y,
    L * cEl * sAz + podVec.z,
  );

  // dr/dφ
  const dx = L * (-sEl * cAz * elDot - cEl * sAz * azDot);
  const dy = L * (cEl * elDot);
  const dz = L * (-sEl * sAz * elDot + cEl * cAz * azDot);
  const dPos = new Vector3(dx, dy, dz);
  const dPosLen = dPos.length();
  const tangent =
    dPosLen > 1e-9 ? dPos.clone().multiplyScalar(1 / dPosLen) : new Vector3();

  // d²r/dφ²
  const ddx =
    L *
    (-cEl * cAz * elDot * elDot +
      2 * sEl * sAz * elDot * azDot -
      sEl * cAz * elDotDot -
      cEl * cAz * azDot * azDot -
      cEl * sAz * azDotDot);
  const ddy = L * (-sEl * elDot * elDot + cEl * elDotDot);
  const ddz =
    L *
    (-cEl * sAz * elDot * elDot -
      2 * sEl * cAz * elDot * azDot -
      sEl * sAz * elDotDot -
      cEl * sAz * azDot * azDot +
      cEl * cAz * azDotDot);
  const ddPos = new Vector3(ddx, ddy, ddz);

  // Wind speed at kite height (ITTC 2011) using the same floor as the legacy model.
  const kiteHeight = sEl * L + MIN_KITE_HEIGHT;
  const windScale = (kiteHeight / REFERENCE_HEIGHT) ** WIND_GRADIENT_EXPONENT;
  const windAtKiteSpeed = windSpeedDeck * windScale;
  const windAtKite = new Vector3(
    Math.cos(windDirection),
    0,
    Math.sin(windDirection),
  ).multiplyScalar(windAtKiteSpeed);

  // Cross-wind speed: v_kite ≈ V_w · L/D · cos(θ_downwind), with θ measured between
  // the kite radial unit and the wind blow direction.
  const cosThetaDownwind = cEl * Math.cos(az - windDirection);
  const speed = flying
    ? Math.max(0, windAtKiteSpeed * LD * cosThetaDownwind)
    : 0;

  const velocity = tangent.clone().multiplyScalar(speed);
  const dPhiDt = dPosLen > 1e-9 ? speed / dPosLen : 0;

  // Apparent wind seen by the kite
  const apparentWind = windAtKite.clone().sub(velocity);
  const apparentWindSpeed = apparentWind.length();

  // Signed curvature in the sphere-tangent plane: ((r' × r'') · radial) / |r'|³
  const radial = new Vector3(cEl * cAz, sEl, cEl * sAz);
  const cross = new Vector3().crossVectors(dPos, ddPos);
  const curvature =
    dPosLen > 1e-9 ? cross.dot(radial) / (dPosLen * dPosLen * dPosLen) : 0;

  return {
    azimuth: az,
    elevation: el,
    position,
    velocity,
    tangent,
    speed,
    curvature,
    apparentWind,
    apparentWindSpeed,
    windAtKite,
    dPhiDt,
  };
}
