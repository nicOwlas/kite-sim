import { degToRad } from "three/src/math/MathUtils";
function traction(props) {
  //   const { radius, azimuth, elevation } = props.kiteAttitude;
  const liftToDragRatio = props.kiteParameters.liftToDrag;
  const kiteSurface = props.kiteParameters.surface_m2;
  const windSpeed = props.windParameters.speed_kt * 0.514; // kt -> m/s
  const windDirection = degToRad(props.windParameters.direction_deg);
  liftCoefficient = 0.776; //LELOUP2013
  airDensity = 1.225; //kg.m-3
  liftToDragAngle = Math.atan(1 / liftToDragRatio);

  const traction =
    ((0.5 * liftCoefficient * airDensity * kiteSurface * windSpeed) ^ 2) /
    Math.cos(liftToDragAngle);

  return traction;
}
