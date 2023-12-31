import { QuadraticBezierLine } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function Tether({
  start,
  end,
  v1 = new THREE.Vector3(),
  v2 = new THREE.Vector3(),
  v3 = new THREE.Vector3(),
}) {
  const ref = useRef();
  useFrame(
    () =>
      ref.current.setPoints(
        start.current.getWorldPosition(v1),
        end.current.getWorldPosition(v2),
        v3.addVectors(v1, v2).multiplyScalar(0.5)
      ),
    []
  );

  return (
    <QuadraticBezierLine
      ref={ref}
      lineWidth={3}
      color="#3b3b3b"
      segments={10}
    />
  );
}
