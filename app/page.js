"use client";
import Cylinder3d from "@/components/Cylinder3d";
import { Canvas } from "@react-three/fiber";

export default function Home() {
  return (
    <Canvas>
      <group>
        <mesh>
          <ambientLight intensity={1} />
          <meshNormalMaterial />
          <boxGeometry args={[2, 2, 2]} />
          <Cylinder3d position={[4, 0, 0]} />
        </mesh>
      </group>
    </Canvas>
  );
}
