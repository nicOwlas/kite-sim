"use client";
import Boat from "@/components/Boat";
import { OrbitControls, Sky } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
export default function Home() {
  return (
    <Canvas
      camera={{
        fov: 75,
        near: 0.1,
        far: 1000,
        position: [-50, 0, -50],
        up: [0, 0, -1],
      }}
    >
      <Sky
        azimuth={3.14}
        inclination={0.6}
        distance={1000}
        material-uniforms-up-value={[0, 0, -1]}
      />
      <ambientLight intensity={1} />
      <directionalLight
        color="red"
        position={[5, 5, 5]}
        attach="sphereGeometry"
      />
      <Boat />
      {/* <Cylinder3d /> */}
      {/* <SampleComponent /> */}
      <OrbitControls
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 2.5}
      />
    </Canvas>
  );
}
