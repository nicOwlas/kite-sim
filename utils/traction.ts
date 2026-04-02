import { MathUtils } from "three";
const { degToRad } = MathUtils;
import {
  AIR_DENSITY,
  KNOTS_TO_MS,
  LIFT_COEFFICIENT,
  MIN_KITE_HEIGHT,
  REFERENCE_HEIGHT,
  WIND_GRADIENT_EXPONENT,
} from "./constants";
import type { TractionInput } from "./types";

const angleDifference = (angle1: number, angle2: number): number => {
  // Return a value between -PI and +PI
  let diff = ((angle1 - angle2 + Math.PI) % (2 * Math.PI)) - Math.PI;
  if (diff <= -Math.PI) diff += 2 * Math.PI;
  return diff;
};

function traction(props: TractionInput): number {
  const { radius, azimuth, elevation } = props.kiteAttitude;
  const liftToDragRatio = props.kiteParameters.liftToDrag;
  const kiteSurface = props.kiteParameters.surface_m2;
  const windSpeed = props.windParameters.speed_kt * KNOTS_TO_MS;
  const windDirection = degToRad(props.windParameters.direction_deg);
  const relativeAzimuth = angleDifference(azimuth, windDirection);
  const liftToDragAngle = Math.atan(1 / liftToDragRatio);

  const kiteHeightAboveSea =
    Math.sin(elevation) * radius + MIN_KITE_HEIGHT;

  // Wind gradient formula (ITTC 2011)
  const windSpeedAtKiteLevel =
    windSpeed * (kiteHeightAboveSea / REFERENCE_HEIGHT) ** WIND_GRADIENT_EXPONENT;

  const tractionForce =
    (0.5 *
      LIFT_COEFFICIENT *
      AIR_DENSITY *
      kiteSurface *
      windSpeedAtKiteLevel ** 2) /
    Math.cos(liftToDragAngle);

  const propulsiveForce =
    tractionForce *
    (Math.cos(relativeAzimuth) * Math.cos(elevation) * Math.cos(windDirection) -
      Math.sin(relativeAzimuth) *
        Math.cos(elevation) *
        Math.sin(windDirection));

  return Math.round(propulsiveForce);
}

export default traction;
