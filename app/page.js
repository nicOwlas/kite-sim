"use client";
import Cylinder3d from "@/components/Cylinder3d";
import SampleComponent from "@/components/SampleComponent";
import { Canvas } from "@react-three/fiber";

export default function Home() {
  return (
    <Canvas>
      {/* <gridHelper /> */}
      <ambientLight intensity={1} />
      <directionalLight
        color="red"
        position={[5, 5, 5]}
        attach="sphereGeometry"
      />
      <Cylinder3d />
      <SampleComponent />
    </Canvas>
  );
}
