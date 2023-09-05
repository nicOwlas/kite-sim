import { degToRad } from "three/src/math/MathUtils";
const angleDifference = (angle1, angle2) => {
  // Return a value between -PI and +PI
  let diff = ((angle1 - angle2 + Math.PI) % (2 * Math.PI)) - Math.PI;
  if (diff <= -Math.PI) diff += 2 * Math.PI;
  return diff;
};

function traction(props) {
  const { radius, azimuth, elevation } = props.kiteAttitude;
  const liftToDragRatio = props.kiteParameters.liftToDrag;
  const kiteSurface = props.kiteParameters.surface_m2;
  const windSpeed = props.windParameters.speed_kt * 0.514; // kt -> m/s
  const windDirection = degToRad(props.windParameters.direction_deg);
  const relativeAzimuth = angleDifference(azimuth, windDirection);
  const liftCoefficient = 0.776; //LELOUP2013
  const airDensity = 1.225; //kg.m-3
  const liftToDragAngle = Math.atan(1 / liftToDragRatio);

  const kiteHeightAboveSea = Math.sin(elevation) * radius + 10; //10m added to avoid a 0m/s velocity when elevation = 0deg

  // Wind gradient formula description given by ITTC 2011
  const windSpeedAtKiteLevel = windSpeed * (kiteHeightAboveSea / 10) ** (1 / 7);

  const traction =
    (0.5 *
      liftCoefficient *
      airDensity *
      kiteSurface *
      windSpeedAtKiteLevel ** 2) /
    Math.cos(liftToDragAngle);

  const propulsiveForce =
    traction *
    (Math.cos(relativeAzimuth) * Math.cos(elevation) * Math.cos(windDirection) -
      Math.sin(relativeAzimuth) *
        Math.cos(elevation) *
        Math.sin(windDirection));

  return Math.round(propulsiveForce);
}

export default traction;

// Test the function
// console.log(angleDifference(Math.PI / 3, Math.PI / 6)); // Should print -Math.PI / 2
// console.log(angleDifference(-Math.PI / 2, Math.PI)); // Should print -Math.PI / 2
// console.log(angleDifference(Math.PI, Math.PI / 2)); // Should print Math.PI / 2
