"use client";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RefObject, useRef, useState } from "react";
import { Color } from "three";
import {
  collectActive,
  type KiteTrailBuffer,
  type KiteTrailSample,
} from "@/utils/kiteTrail";

interface KiteTrailProps {
  trailBufferRef: RefObject<KiteTrailBuffer | null>;
  globalPhaseRef: RefObject<number>;
}

type RGBA = [number, number, number, number];
type XYZ = [number, number, number];

const TRAIL_COLOR = new Color("#ea580c");
const MAX_AGE = 2 * Math.PI;

export default function KiteTrail({
  trailBufferRef,
  globalPhaseRef,
}: KiteTrailProps) {
  const activeRef = useRef<KiteTrailSample[]>([]);
  const [data, setData] = useState<{ points: XYZ[]; colors: RGBA[] }>({
    points: [],
    colors: [],
  });

  useFrame(() => {
    const buf = trailBufferRef.current;
    if (!buf) return;
    const now = globalPhaseRef.current;
    const active = collectActive(buf, now, MAX_AGE, activeRef.current);

    if (active.length < 2) {
      if (data.points.length !== 0) setData({ points: [], colors: [] });
      return;
    }

    const points: XYZ[] = new Array(active.length);
    const colors: RGBA[] = new Array(active.length);
    for (let i = 0; i < active.length; i++) {
      const s = active[i];
      points[i] = [s.position.x, s.position.y, s.position.z];
      const age = now - s.globalPhase;
      const alpha = Math.max(0, 1 - age / MAX_AGE);
      colors[i] = [TRAIL_COLOR.r, TRAIL_COLOR.g, TRAIL_COLOR.b, alpha];
    }
    setData({ points, colors });
  });

  if (data.points.length < 2) return null;
  return (
    <Line
      points={data.points}
      vertexColors={data.colors}
      lineWidth={2}
      depthWrite={false}
    />
  );
}
