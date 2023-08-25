"use client";
import BoxyBoat from "@/components/BoxyBoat";
import Spaceman from "@/components/Spaceman";
import Tether from "@/components/Tether";
import { Float, OrbitControls, Sky, Stats } from "@react-three/drei";
import {
  Canvas,
  extend,
  useFrame,
  useLoader,
  useThree,
} from "@react-three/fiber";
import { useControls } from "leva";
import { Suspense, useMemo, useRef } from "react";
import { PlaneGeometry, RepeatWrapping, TextureLoader, Vector3 } from "three";
import { Water } from "three-stdlib";

extend({ Water });

function Ocean() {
  const ref = useRef();
  const gl = useThree((state) => state.gl);
  let waterNormals = useLoader(TextureLoader, "/waternormals.jpeg");

  waterNormals.wrapS = waterNormals.wrapT = RepeatWrapping;
  const planeGeometry = new PlaneGeometry(10000, 10000);
  const geom = useMemo(() => planeGeometry, []);
  const config = useMemo(
    () => ({
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: new Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: false,
      format: gl.encoding,
    }),
    [waterNormals]
  );
  useFrame((state, delta) => {
    ref.current.material.uniforms.time.value += delta;
  });
  return <water ref={ref} args={[geom, config]} rotation-x={-Math.PI / 2} />;
}
// rotation-x={-Math.PI / 2}
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
        far: 1000,
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
          // spherical={[50, Math.PI / 2, Math.PI / 2]}
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
