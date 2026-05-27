import { AIR_DENSITY, LIFT_COEFFICIENT } from "./constants";
import type { TractionInput } from "./types";

function traction(props: TractionInput): number {
  const { apparentWindSpeed, tetherDirection, boatForward, kiteParameters } =
    props;
  const liftToDragRatio = Math.max(kiteParameters.liftToDrag, 0.0001);
  const kiteSurface = kiteParameters.surface_m2;

  // |F| = 0.5 · Cl · ρ · S · |V_app|² · √(1 + 1/(L/D)²)
  // The √(1 + 1/(L/D)²) factor folds in the drag-induced offset of the
  // tether vs. lift direction (equivalent to dividing by cos(atan(1/(L/D)))).
  const liftToDragFactor = Math.sqrt(
    1 + 1 / (liftToDragRatio * liftToDragRatio),
  );
  const forceMagnitude =
    0.5 *
    LIFT_COEFFICIENT *
    AIR_DENSITY *
    kiteSurface *
    apparentWindSpeed *
    apparentWindSpeed *
    liftToDragFactor;

  const projection = tetherDirection.dot(boatForward);
  return Math.round(forceMagnitude * projection);
}

export default traction;
