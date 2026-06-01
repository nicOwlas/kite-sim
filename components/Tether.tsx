import { QuadraticBezierLine } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RefObject, useRef } from "react";
import * as THREE from "three";

interface TetherProps {
  start: RefObject<THREE.Object3D | null>;
  end: RefObject<THREE.Object3D | null>;
}

export default function Tether({ start, end }: TetherProps) {
  const ref = useRef<any>(null);
  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const v3 = new THREE.Vector3();

  useFrame(() => {
    if (!ref.current || !start.current || !end.current) return;
    ref.current.setPoints(
      start.current.getWorldPosition(v1),
      end.current.getWorldPosition(v2),
      v3.addVectors(v1, v2).multiplyScalar(0.5)
    );
  });

  return (
    <QuadraticBezierLine
      ref={ref}
      lineWidth={3}
      color="#3b3b3b"
      // @ts-expect-error segments not in QuadraticBezierLine types
      segments={10}
    />
  );
}
