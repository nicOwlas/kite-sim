import { AIR_DENSITY, LIFT_COEFFICIENT } from "./constants";
import type { KiteParameters, TractionInput } from "./types";

/**
 * Magnitude of the aerodynamic force the kite exerts on the tether, i.e. the
 * full line tension (always ≥ 0):
 *
 *   |F| = 0.5 · Cl · ρ · S · |V_app|² · √(1 + 1/(L/D)²)
 *
 * The √(1 + 1/(L/D)²) factor folds in the drag-induced offset of the tether
 * vs. lift direction (equivalent to dividing by cos(atan(1/(L/D)))).
 */
export function tetherTension(
  apparentWindSpeed: number,
  kiteParameters: KiteParameters,
): number {
  const liftToDragRatio = Math.max(kiteParameters.liftToDrag, 0.0001);
  const liftToDragFactor = Math.sqrt(
    1 + 1 / (liftToDragRatio * liftToDragRatio),
  );
  return (
    0.5 *
    LIFT_COEFFICIENT *
    AIR_DENSITY *
    kiteParameters.surface_m2 *
    apparentWindSpeed *
    apparentWindSpeed *
    liftToDragFactor
  );
}

function traction(props: TractionInput): number {
  const { apparentWindSpeed, tetherDirection, boatForward, kiteParameters } =
    props;

  const forceMagnitude = tetherTension(apparentWindSpeed, kiteParameters);
  const projection = tetherDirection.dot(boatForward);
  return Math.round(forceMagnitude * projection);
}

export default traction;
