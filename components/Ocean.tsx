import { extend, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { PlaneGeometry, RepeatWrapping, TextureLoader, Vector3 } from "three";
import { Water } from "three-stdlib";

extend({ Water });

export default function Ocean() {
  const ref = useRef<any>(null);
  const gl = useThree((state) => state.gl);
  const waterNormals = useLoader(TextureLoader, "/waternormals.jpeg");

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
      format: (gl as any).encoding,
    }),
    [waterNormals]
  );
  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.material.uniforms.time.value += delta;
    }
  });
  // @ts-expect-error Water is extended into R3F but has no JSX type
  return <water ref={ref} args={[geom, config]} rotation-x={-Math.PI / 2} />;
}
