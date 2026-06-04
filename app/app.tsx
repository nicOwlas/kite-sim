"use client";
import Boat from "@/components/Boat";
import CenterPulse, { type CenterPulseEvent } from "@/components/CenterPulse";
import Dashboard from "@/components/Dashboard";
import FlightEnvelope from "@/components/FlightEnvelope";
import Kite from "@/components/Kite";
import KiteTrail from "@/components/KiteTrail";
import Ocean from "@/components/Ocean";
import Pod from "@/components/Pod";
import Tether from "@/components/Tether";
import {
  CAMERA_CONFIG,
  KITE_MODEL_SURFACE,
  ORBIT_TARGET,
  POD_POSITION,
} from "@/utils/constants";
import KiteFlight from "@/components/KiteFlight";
import type { KiteFlightReadout } from "@/hooks/useKiteFlight";
import { createTrailBuffer, type KiteTrailBuffer } from "@/utils/kiteTrail";
import { Float, OrbitControls, Sky, Stats } from "@react-three/drei";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { useControls } from "leva";
import { Suspense, useRef, useState } from "react";
import { Group, MathUtils, Points, Spherical, Vector3 } from "three";

const { degToRad } = MathUtils;

export default function App() {
  const kite = useRef<Group>(null);
  const pod = useRef<Points>(null);
  const trailBufferRef = useRef<KiteTrailBuffer | null>(null);
  if (trailBufferRef.current === null) {
    trailBufferRef.current = createTrailBuffer();
  }
  const globalPhaseRef = useRef(0);
  const pulseRef = useRef<CenterPulseEvent | null>(null);
  const sagRef = useRef(0);

  const kiteParameters = useControls("Kite", {
    length_m: { value: 300, min: 0, max: 400, step: 1 },
    surface_m2: { value: 1000, min: 8, max: 1600, step: 1 },
    liftToDrag: { value: 6, min: 4, max: 10, step: 1 },
    tetherWeight_kgpm: { value: 1.5, min: 0, max: 20, step: 0.1 },
  });

  const windParameters = useControls("Wind on deck", {
    speed_mps: { value: 5, min: 0, max: 25, step: 0.5 },
    direction_deg: { value: 0, min: -180, max: 180, step: 1 },
  });

  const flightParameters = useControls("Flight", {
    flying: true,
    amplitude_az_deg: { value: 30, min: 0, max: 80, step: 1 },
    amplitude_el_deg: { value: 10, min: 0, max: 40, step: 1 },
  });

  const displayParameters = useControls("Display", {
    showOcean: true,
  });

  // Store center offset *relative to wind direction* so the loop tracks the wind.
  const [centerOffset, setCenterOffset] = useState({
    azimuthRelative: 0,
    elevation: Math.PI / 12,
  });
  const windDirectionRad = degToRad(windParameters.direction_deg);
  const center = {
    azimuth: windDirectionRad + centerOffset.azimuthRelative,
    elevation: centerOffset.elevation,
  };

  function handleClickedEnvelope(event: ThreeEvent<MouseEvent>) {
    if (event.intersections.length === 0) return;
    const point = event.intersections[0].point;
    // Account that origin of envelope is at POD_POSITION
    const translated = new Vector3(
      point.x - POD_POSITION[0],
      point.y - POD_POSITION[1],
      point.z - POD_POSITION[2],
    );
    const sph = new Spherical().setFromVector3(translated);
    const clickedAzimuth = Math.PI / 2 - sph.theta;
    const clickedElevation = Math.PI / 2 - sph.phi;
    setCenterOffset({
      azimuthRelative: clickedAzimuth - windDirectionRad,
      elevation: clickedElevation,
    });
    pulseRef.current = {
      point: point.clone(),
      normal: translated.clone().normalize(),
      startMs: performance.now(),
    };
  }

  const [readout, setReadout] = useState<KiteFlightReadout>({
    propulsiveForceInstant: 0,
    apparentWindMps: 0,
    kiteElevationDeg: 0,
    kiteAltitudeM: 0,
  });

  return (
    <>
      <Dashboard
        propulsiveForceInstant={readout.propulsiveForceInstant}
        apparentWindMps={readout.apparentWindMps}
        kiteAltitudeM={readout.kiteAltitudeM}
      />
      <Canvas camera={CAMERA_CONFIG}>
        <ambientLight />
        <pointLight position={[100, 100, 100]} intensity={100} />
        <pointLight position={[-100, -100, -100]} intensity={100} />
        {displayParameters.showOcean ? (
          <Suspense fallback={null}>
            <Ocean />
            {/* @ts-expect-error Sky scale prop not in types */}
            <Sky scale={1000} sunPosition={[2000, 350, -200]} turbidity={0.1} />
          </Suspense>
        ) : (
          <gridHelper args={[1000, 100]} />
        )}
        <FlightEnvelope
          kiteParameters={kiteParameters}
          windParameters={windParameters}
          parameters={{
            origin: POD_POSITION,
            color: "#856e82",
            wireframe: true,
            name: "wiredEnvelope",
            widthSegments: 32,
            heightSegments: 16,
          }}
          onMouseClick={handleClickedEnvelope}
        />

        <Float rotationIntensity={0.05} floatIntensity={10} speed={1}>
          <Pod ref={pod} position={POD_POSITION} />
          <Boat position={[0, -10, 0]} scale={5} />
        </Float>

        <Kite
          ref={kite}
          scale={Math.sqrt(kiteParameters.surface_m2 / KITE_MODEL_SURFACE)}
        />
        <KiteFlight
          kiteRef={kite}
          center={center}
          amplitudes={{
            azimuth: degToRad(flightParameters.amplitude_az_deg),
            elevation: degToRad(flightParameters.amplitude_el_deg),
          }}
          kiteParameters={kiteParameters}
          windParameters={windParameters}
          flying={flightParameters.flying}
          onReadout={setReadout}
          trailBufferRef={trailBufferRef}
          globalPhaseRef={globalPhaseRef}
          sagRef={sagRef}
        />
        <KiteTrail
          trailBufferRef={trailBufferRef}
          globalPhaseRef={globalPhaseRef}
        />
        <CenterPulse pulseRef={pulseRef} />
        <Tether start={pod} end={kite} sagRef={sagRef} />
        <OrbitControls makeDefault target={new Vector3(...ORBIT_TARGET)} />
        {process.env.NODE_ENV === "development" && <Stats />}
      </Canvas>
    </>
  );
}
