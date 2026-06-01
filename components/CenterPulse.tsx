"use client";
import { useFrame } from "@react-three/fiber";
import { RefObject, useRef } from "react";
import { DoubleSide, Mesh, MeshBasicMaterial, Vector3 } from "three";

export interface CenterPulseEvent {
  point: Vector3;
  normal: Vector3;
  startMs: number;
}

interface CenterPulseProps {
  pulseRef: RefObject<CenterPulseEvent | null>;
}

const DURATION_MS = 1500;
const INNER_MIN = 0.5;
const INNER_MAX = 8;
const RING_THICKNESS_RATIO = 0.08;

export default function CenterPulse({ pulseRef }: CenterPulseProps) {
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<MeshBasicMaterial>(null);
  const lookAtTarget = useRef(new Vector3());

  useFrame(() => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;
    const pulse = pulseRef.current;
    if (!pulse) {
      if (mesh.visible) mesh.visible = false;
      return;
    }
    const t = (performance.now() - pulse.startMs) / DURATION_MS;
    if (t < 0 || t >= 1) {
      if (mesh.visible) mesh.visible = false;
      return;
    }
    mesh.visible = true;
    const innerR = INNER_MIN + (INNER_MAX - INNER_MIN) * t;
    mesh.scale.setScalar(innerR);
    mesh.position.copy(pulse.point);
    lookAtTarget.current.copy(pulse.point).add(pulse.normal);
    mesh.lookAt(lookAtTarget.current);
    mat.opacity = 1 - t;
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <ringGeometry args={[1, 1 + RING_THICKNESS_RATIO, 64]} />
      <meshBasicMaterial
        ref={matRef}
        color="#ea580c"
        transparent
        opacity={0}
        side={DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
