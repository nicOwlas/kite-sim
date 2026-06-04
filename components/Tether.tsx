import { QuadraticBezierLine } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RefObject, useRef } from "react";
import * as THREE from "three";

interface TetherProps {
  start: RefObject<THREE.Object3D | null>;
  end: RefObject<THREE.Object3D | null>;
  /** Midspan sag (m) below the chord; 0 renders a straight line. */
  sagRef?: RefObject<number>;
}

export default function Tether({ start, end, sagRef }: TetherProps) {
  const ref = useRef<any>(null);
  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const v3 = new THREE.Vector3();

  useFrame(() => {
    if (!ref.current || !start.current || !end.current) return;
    start.current.getWorldPosition(v1);
    end.current.getWorldPosition(v2);
    // Quadratic Bézier = parabola. Its apex reaches only halfway to the control
    // point, so offset the chord midpoint down by 2·sag to drop the midspan by sag.
    const sag = sagRef?.current ?? 0;
    v3.addVectors(v1, v2)
      .multiplyScalar(0.5)
      .setY((v1.y + v2.y) / 2 - 2 * sag);
    ref.current.setPoints(v1, v2, v3);
  });

  return (
    <QuadraticBezierLine
      ref={ref}
      lineWidth={3}
      color="#3b3b3b"
      // @ts-expect-error segments not in QuadraticBezierLine types
      segments={24}
    />
  );
}
