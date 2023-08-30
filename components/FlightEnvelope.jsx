// import { Wireframe } from "@react-three/drei";
import { degToRad } from "three/src/math/MathUtils";

function FlightEnvelope(props) {
  console.log("Flight Envelope", props);
  return (
    <mesh
      position={[0, 0, 0]}
      onClick={(e) => props.onMouseClick(e, props.parameters.name)}
      name={props.parameters.name}
    >
      <sphereGeometry
        args={[
          props.kiteParameters.length_m,
          props.parameters.widthSegments ? props.parameters.widthSegments : 64,
          props.parameters.heightSegments
            ? props.parameters.heightSegments
            : 32,
          degToRad(-props.kiteParameters.azimuth_deg + 90),
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
