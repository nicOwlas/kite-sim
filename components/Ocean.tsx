import { extend, useFrame, useLoader } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { PlaneGeometry, RepeatWrapping, TextureLoader, Vector3 } from "three";
import { Water } from "three-stdlib";

extend({ Water });

export default function Ocean() {
  const ref = useRef<any>(null);
  const waterNormals = useLoader(TextureLoader as any, "/waternormals.jpeg");

  // eslint-disable-next-line react-hooks/immutability
  waterNormals.wrapS = waterNormals.wrapT = RepeatWrapping;

  const geom = useMemo(() => new PlaneGeometry(10000, 10000), []);
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
    }),
    [waterNormals]
  );

  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.material.uniforms.time.value += delta;
    }
  });
  return <water ref={ref} args={[geom, config]} rotation-x={-Math.PI / 2} />;
}
