"use client";
import Boat from "@/components/Boat";
import Spaceman from "@/components/Spaceman";
import Tether from "@/components/Tether";
export default function Home() {
  return (
    <Canvas
      camera={{
        fov: 75,
        near: 0.1,
        far: 1000,
        position: [-50, 0, -100],
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
      <Boat ref={boat} />
      <Float rotationIntensity={0.4} floatIntensity={20} speed={1.5}>
        <Spaceman position={[10, 0, -15]} scale={3} rotation={[-1.6, -1.6, 0]}>
          <object3D ref={spaceman} />
        </Spaceman>
      </Float>
      <Tether start={boat} end={spaceman} />
      {/* <Cylinder3d /> */}
      {/* <SampleComponent /> */}
      <OrbitControls makeDefault />
    </Canvas>
  );
}
