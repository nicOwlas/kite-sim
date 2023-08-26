"use client";
import BoxyBoat from "@/components/BoxyBoat";
import Ocean from "@/components/Ocean";
import Spaceman from "@/components/Spaceman";
import Tether from "@/components/Tether";
import { Float, OrbitControls, Sky, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import { Suspense, useRef } from "react";
import { Vector3 } from "three";

export default function Home() {
  const spaceman = useRef();
  const boat = useRef();
  const parameters = useControls({
    cableLength_m: { value: 100, min: 0, max: 400, step: 10 },
    boatSpeed_kt: { value: 10, min: 0, max: 50, step: 1 },
    windSpeed_kt: { value: 10, min: 0, max: 50, step: 1 },
    windOrientation_deg: { value: 0, min: 0, max: 360, step: 1 },
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
      <pointLight position={[100, 100, 100]} />
      <pointLight position={[-100, -100, -100]} />
      <Suspense fallback={null}>
        <Ocean />
      </Suspense>
      <Sky scale={1000} sunPosition={[500, 150, -200]} turbidity={0.1} />
      <BoxyBoat ref={boat} />
      {/* <Boat ref={boat} position={[0, -10, 0]} scale={5} /> */}
      <Float rotationIntensity={0.4} floatIntensity={20} speed={1.5}>
        <Spaceman
          position={new Vector3().setFromSphericalCoords(
            parameters.cableLength_m,
            Math.PI / 4,
            Math.PI / 4
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
