"use client";
import { RefObject } from "react";
import { Group } from "three";
import { useKiteFlight, type KiteFlightReadout } from "@/hooks/useKiteFlight";
import type { FlightAmplitudes, FlightCenter } from "@/utils/flightPath";
import type { KiteParameters, WindParameters } from "@/utils/types";

interface KiteFlightProps {
  kiteRef: RefObject<Group | null>;
  center: FlightCenter;
  amplitudes: FlightAmplitudes;
  kiteParameters: KiteParameters;
  windParameters: WindParameters;
  flying: boolean;
  onReadout: (r: KiteFlightReadout) => void;
}

/** Lives inside <Canvas> so useFrame can run. Drives the kite ref each frame. */
export default function KiteFlight(props: KiteFlightProps) {
  useKiteFlight(props);
  return null;
}
