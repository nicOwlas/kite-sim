"use client";
import Boat from "@/components/Boat";
import Dashboard from "@/components/Dashboard";
import FlightEnvelope from "@/components/FlightEnvelope";
import Kite from "@/components/Kite";
import Ocean from "@/components/Ocean";
import Pod from "@/components/Pod";
import Tether from "@/components/Tether";
import { CAMERA_CONFIG, KITE_MODEL_SURFACE, ORBIT_TARGET, POD_POSITION } from "@/utils/constants";
import traction from "@/utils/traction";
import { Float, OrbitControls, Sky, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import { Suspense, useMemo, useRef, useState } from "react";
import { Group, Points, Spherical, Vector3 } from "three";
import { MathUtils } from "three";
const { degToRad } = MathUtils;
import type { KiteAttitude } from "@/utils/types";

export default function App() {
  const kite = useRef<Group>(null);
  const pod = useRef<Points>(null);

  const kiteParameters = useControls("Kite", {
    length_m: { value: 150, min: 0, max: 400, step: 1 },
    surface_m2: { value: 400, min: 8, max: 1600, step: 1 },
    liftToDrag: { value: 6, min: 4, max: 10, step: 1 },
  });

  const windParameters = useControls("Wind on deck", {
    speed_kt: { value: 20, min: 0, max: 50, step: 1 },
    direction_deg: {
      value: 0,
      min: -180,
      max: 180,
      step: 1,
    },
  });

  const displayParameters = useControls("Display", {
    showOcean: true,
  });

  const [kiteAttitude, setKiteAttitude] = useState<KiteAttitude>({
    radius: kiteParameters.length_m,
    azimuth: degToRad(windParameters.direction_deg),
    elevation: Math.PI / 12,
    roll: 0,
    pitch: 0,
    yaw: degToRad(windParameters.direction_deg),
  });

  function handleClickedEnvelope(event: { intersections: { point: Vector3 }[] }) {
    if (event.intersections.length === 0) return;
    const point = event.intersections[0].point;
    // Account that origin of envelop is at POD_POSITION
    // Step 1: Translate point to new origin
    const translatedPoint = new Vector3(
      point.x - POD_POSITION[0],
      point.y - POD_POSITION[1],
      point.z - POD_POSITION[2]
    );

    const intersectionSphericalCoordinates = new Spherical().setFromVector3(
      translatedPoint
    );

    // Transform because THREE and World axis are not aligned
    setKiteAttitude({
      radius: intersectionSphericalCoordinates.radius,
      azimuth: Math.PI / 2 - intersectionSphericalCoordinates.theta,
      elevation: Math.PI / 2 - intersectionSphericalCoordinates.phi,
      roll: 0,
      pitch: 0,
      yaw: degToRad(windParameters.direction_deg),
    });
  }

  const kiteAttitudeWithRadius = useMemo(
    () => ({ ...kiteAttitude, radius: kiteParameters.length_m }),
    [kiteAttitude, kiteParameters.length_m]
  );

  const propulsiveForce = useMemo(
    () => traction({ kiteAttitude: kiteAttitudeWithRadius, kiteParameters, windParameters }),
    [kiteAttitudeWithRadius, kiteParameters, windParameters]
  );

  return (
    <>
      <Dashboard
        propulsiveForce={propulsiveForce}
        kiteElevationDeg={Math.round(MathUtils.radToDeg(kiteAttitudeWithRadius.elevation))}
        kiteAltitudeM={Math.round(Math.sin(kiteAttitudeWithRadius.elevation) * kiteAttitudeWithRadius.radius)}
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

        <Float rotationIntensity={0.2} floatIntensity={0.2} speed={1}>
          <Kite
            podPosition={POD_POSITION}
            kiteAttitude={kiteAttitudeWithRadius}
            kiteParameters={kiteParameters}
            windParameters={windParameters}
            scale={Math.sqrt(kiteParameters.surface_m2 / KITE_MODEL_SURFACE)}
            yaw={degToRad(windParameters.direction_deg)}
            ref={kite}
          />
        </Float>
        <Tether start={pod} end={kite} />
        <OrbitControls makeDefault target={new Vector3(...ORBIT_TARGET)} />
        {process.env.NODE_ENV === "development" && <Stats />}
      </Canvas>
    </>
  );
}
