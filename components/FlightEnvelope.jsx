// import { Wireframe } from "@react-three/drei";
import { degToRad } from "three/src/math/MathUtils";

function FlightEnvelope(props) {
  // function handleClick(event) {
  //   if (props.parameters.name === "filledEnvelope") {
  //     console.log("Clicked", event.intersections[0].point);
  //     // console.log("Clicked", event.eventObject);
  //     const intersection =
  //       event.intersections.length > 0 ? event.intersections[0] : null;
  //     props.onMove(intersection.point);
  //   }
  // }
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
