import { degToRad } from "three/src/math/MathUtils";
function FlightEnvelope(props) {
  return (
    <mesh
      position={props.parameters.origin}
      // position={[0, 0, 0]}
      onClick={(e) => props.onMouseClick(e)}
    >
      <sphereGeometry
        args={[
          props.kiteParameters.length_m,
          32,
          16,
          degToRad(-props.windParameters.direction_deg + 90),
          Math.PI,
          0,
          Math.PI / 2,
        ]}
      />

      <meshBasicMaterial
        color={props.parameters.color}
        transparent="true"
        opacity={0.6}
        side={2}
        wireframe={props.parameters.wireframe}
      />
    </mesh>
  );
}

export default FlightEnvelope;
