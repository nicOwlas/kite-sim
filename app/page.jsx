"use client";
import Boat from "@/components/Boat";
import FlightEnvelope from "@/components/FlightEnvelope";
import Kite from "@/components/Kite";
import Ocean from "@/components/Ocean";
import Pod from "@/components/Pod";
import { Float, OrbitControls, Sky, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import { Suspense, useRef, useState } from "react";
import { useSpring } from "react-spring/three";
import { Spherical, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils";

//TODO
//Wind gradient
// DONE Display the flight envelop?
// DONE Rotation of kite
// Display traction (N)
// Display kite elevation

export default function Home() {
  const kite = useRef();
  const pod = useRef();
  const podPosition = [195, 15, 0];

  const kiteParameters = useControls("Kite", {
    length_m: { value: 100, min: 0, max: 400, step: 10 },
    surface_m2: { value: 10, min: 8, max: 1600, step: 1 },
    liftToDrag: { value: 6, min: 4, max: 10, step: 1 },
  });

  const boatParameters = useControls("Boat", {
    speed_kt: { value: 10, min: 0, max: 50, step: 1 },
    showOcean: true,
  });

  const windParameters = useControls("Wind", {
    speed_kt: { value: 10, min: 0, max: 50, step: 1 },
    direction_deg: {
      value: 0,
      min: -180,
      max: 180,
      step: 1,
    },
  });

  const [kiteAttitude, setKiteAttitude] = useState({
    radius: kiteParameters.length_m,
    azimuth: degToRad(windParameters.direction_deg),
    elevation: Math.PI / 12,
    roll: 0,
    pitch: 0,
    yaw: degToRad(windParameters.direction_deg),
  });

  const springProps = useSpring({
    from: kiteAttitude,
    to: kiteAttitude,
    config: { tension: 40, friction: 10 },
  });

  function handleClickedEnvelope(event) {
    const intersectionCartesianCoordinates =
      event.intersections.length > 0 ? event.intersections[0] : null;
    const point = intersectionCartesianCoordinates.point;
    // Account that origin of envelop is at podPosition
    // Step 1: Translate point to new origin
    const translatedPoint = new Vector3(
      point.x - podPosition[0],
      point.y - podPosition[1],
      point.z - podPosition[2]
    );

    const intersectionSphericalCoordinates = new Spherical().setFromVector3(
      translatedPoint
    );
    console.log("Kite spherical coordinates", intersectionSphericalCoordinates);

    // Transform because THREE and World axis are not aligned
    setKiteAttitude({
      radius: intersectionSphericalCoordinates.radius,
      azimuth: Math.PI / 2 - intersectionSphericalCoordinates.theta,
      elevation: Math.PI / 2 - intersectionSphericalCoordinates.phi,
      roll: 0,
      pitch: 0,
      yaw: degToRad(windParameters.direction_deg),
    });

    console.log("KitePosition:", kiteAttitude);
  }

  return (
    <Canvas
      camera={{
        fov: 60,
        near: 0.1,
        far: 3000,
        position: [120, 50, 120],
      }}
    >
      <ambientLight />
      <pointLight position={[100, 100, 100]} intensity={100} />
      <pointLight position={[-100, -100, -100]} intensity={100} />
      {boatParameters.showOcean ? (
        <Suspense fallback={null}>
          <Ocean />
          <Sky scale={1000} sunPosition={[2000, 350, -200]} turbidity={0.1} />
        </Suspense>
      ) : (
        <gridHelper args={[1000, 100]} />
      )}
      <FlightEnvelope
        kiteParameters={kiteParameters}
        windParameters={windParameters}
        parameters={{
          origin: podPosition,
          color: "#856e82",
          wireframe: true,
          name: "wiredEnvelope",
          widthSegments: 32,
          heightSegments: 16,
        }}
        onMouseClick={handleClickedEnvelope}
      />
      <Pod ref={pod} position={podPosition} />
      <Boat position={[0, -10, 0]} scale={5} />
      <Kite
        podPosition={podPosition}
        kiteAttitude={kiteAttitude}
        // kiteAttitude={springProps}
        kiteParameters={kiteParameters}
        windParameters={windParameters}
        scale={4}
        yaw={degToRad(windParameters.direction_deg)}
        ref={kite}
      />
      <Float rotationIntensity={0.4} floatIntensity={0} speed={1.5}></Float>
      {/* <Tether start={pod} end={kite} /> */}
      <OrbitControls makeDefault target={new Vector3(200, 50, 0)} />
      <Stats />
    </Canvas>
  );
}
