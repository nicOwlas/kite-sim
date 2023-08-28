"use client";
import BoxyBoat from "@/components/BoxyBoat";
import FlightEnvelope from "@/components/FlightEnvelope";
import Spaceman from "@/components/Spaceman";
import Tether from "@/components/Tether";
import { Float, OrbitControls, Sky, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import { Suspense, useRef } from "react";
import { Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils";

//TODO
//Wind gradient
//Display the flight envelop?
//Optimal elevation is around 15deg

export default function Home() {
  const spaceman = useRef();
  const boat = useRef();

  const kiteParameters = useControls("Kite", {
    length_m: { value: 100, min: 0, max: 400, step: 10 },
    surface_m2: { value: 10, min: 8, max: 1600, step: 1 },
    liftToDrag: { value: 6, min: 4, max: 10, step: 1 },
    azimuth_deg: { value: 0, min: -180, max: 180, step: 1 },
  });

  const boatParameters = useControls("Boat", {
    speed_kt: { value: 10, min: 0, max: 50, step: 1 },
  });

  const windParameters = useControls("Wind", {
    speed_kt: { value: 10, min: 0, max: 50, step: 1 },
    orientation_deg: { value: 0, min: -180, max: 180, step: 1 },
  });

  return (
    <Canvas
      camera={{
        fov: 75,
        near: 0.1,
        far: 3000,
        position: [-30, 20, 0],
      }}
    >
      <ambientLight />
      <pointLight position={[100, 100, 100]} intensity={10} />
      <pointLight position={[-100, -100, -100]} intensity={10} />
      <Suspense fallback={null}>{/* <Ocean /> */}</Suspense>
      <gridHelper args={[1000, 100]} />
      <FlightEnvelope
        kiteParameters={kiteParameters}
        parameters={{ color: "#0000ff", wireframe: true }}
      />
      <FlightEnvelope
        kiteParameters={kiteParameters}
        parameters={{ color: "#ffddee", wireframe: false }}
      />
      <Sky scale={1000} sunPosition={[500, 150, -200]} turbidity={0.1} />
      <BoxyBoat ref={boat} />
      {/* <Boat ref={boat} position={[0, -10, 0]} scale={5} /> */}
      <Float rotationIntensity={0.4} floatIntensity={20} speed={1.5}>
        <Spaceman
          position={new Vector3().setFromSphericalCoords(
            kiteParameters.length_m,
            Math.PI / 4,
            degToRad(-kiteParameters.azimuth_deg + 90)
          )}
          scale={3}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <object3D ref={spaceman} />
        </Spaceman>
      </Float>
      <Tether start={boat} end={spaceman} />
      <OrbitControls makeDefault />
      <Stats />
    </Canvas>
  );
}
