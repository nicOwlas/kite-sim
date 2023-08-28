// import { Wireframe } from "@react-three/drei";
import { useRef } from "react";
import { degToRad } from "three/src/math/MathUtils";
function FlightEnvelope(props) {
  const refWireFrame = useRef();

  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry
        args={[
          props.kiteParameters.length_m,
          64,
          32,
          degToRad(-props.kiteParameters.azimuth_deg + 90),
          Math.PI,
          0,
          Math.PI / 2,
        ]}
      />

      <meshBasicMaterial
        color={props.parameters.color}
        transparent="true"
        opacity={0.8}
        side={2}
        wireframe={props.parameters.wireframe}
      />
    </mesh>
  );
}

export default FlightEnvelope;
