import { ThreeEvent } from "@react-three/fiber";
import { MathUtils } from "three";
const { degToRad } = MathUtils;
import type { KiteParameters, WindParameters } from "@/utils/types";

interface FlightEnvelopeParameters {
  origin: number[];
  color: string;
  wireframe: boolean;
  name: string;
  widthSegments: number;
  heightSegments: number;
}

interface FlightEnvelopeProps {
  kiteParameters: KiteParameters;
  windParameters: WindParameters;
  parameters: FlightEnvelopeParameters;
  onMouseClick: (event: ThreeEvent<MouseEvent>) => void;
}

function FlightEnvelope({ kiteParameters, windParameters, parameters, onMouseClick }: FlightEnvelopeProps) {
  return (
    <mesh
      position={parameters.origin as [number, number, number]}
      onClick={(e) => onMouseClick(e)}
    >
      <sphereGeometry
        args={[
          kiteParameters.length_m,
          32,
          16,
          degToRad(-windParameters.direction_deg + 90),
          Math.PI,
          0,
          Math.PI / 2,
        ]}
      />

      <meshBasicMaterial
        color={parameters.color}
        transparent={true}
        opacity={0.6}
        side={2}
        wireframe={parameters.wireframe}
      />
    </mesh>
  );
}

export default FlightEnvelope;
