"use client";
import BoxyBoat from "@/components/BoxyBoat";
import FlightEnvelope from "@/components/FlightEnvelope";
import Kite from "@/components/Kite";
import { Float, OrbitControls, Sky, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import { Suspense, useRef, useState } from "react";
import { Spherical } from "three";
import { degToRad } from "three/src/math/MathUtils";

//TODO
//Wind gradient
//Display the flight envelop?
//Optimal elevation is around 15deg

export default function Home() {
  const spaceman = useRef();
  const kite = useRef();
  const boat = useRef();

  const kiteParameters = useControls("Kite", {
    length_m: { value: 100, min: 0, max: 400, step: 10 },
    surface_m2: { value: 10, min: 8, max: 1600, step: 1 },
    liftToDrag: { value: 6, min: 4, max: 10, step: 1 },
    azimuth_deg: { value: 0, min: -180, max: 180, step: 1 },
  });

  const boatParameters = useControls("Boat", {
    speed_kt: { value: 10, min: 0, max: 50, step: 1 },
  });

  const windParameters = useControls("Wind", {
    speed_kt: { value: 10, min: 0, max: 50, step: 1 },
    orientation_deg: { value: 0, min: -180, max: 180, step: 1 },
  });

  const [kiteAttitude, setKiteAttitude] = useState({
    radius: kiteParameters.length_m,
    azimuth: degToRad(kiteParameters.azimuth_deg),
    elevation: Math.PI / 6,
    roll: 0,
    pitch: 0,
    yaw: degToRad(kiteParameters.azimuth_deg),
  });

  function moveKite(position) {
    console.log("Page here: recorded a click at this position", position);
  }

  function handleClickedEnvelope(event, envelopeName) {
    if (envelopeName === "filledEnvelope") {
      console.log("handleClickedEnvelope", event.intersections[0].point);
      console.log("handleClickedEnvelope", event.eventObject);
      const intersectionCartesianCoordinates =
        event.intersections.length > 0 ? event.intersections[0] : null;
      const intersectionSphericalCoordinates = new Spherical().setFromVector3(
        intersectionCartesianCoordinates.point
      );

      // Transform because THREE and World axis are not aligned
      setKiteAttitude({
        radius: intersectionSphericalCoordinates.radius,
        azimuth: Math.PI / 2 - intersectionSphericalCoordinates.theta,
        elevation: Math.PI / 2 - intersectionSphericalCoordinates.phi,
        roll: 0,
        pitch: 0,
        yaw: degToRad(kiteParameters.azimuth_deg),
      });

      console.log("KitePosition:", kiteAttitude);
    }
  }

  function relativeWindDirection() {}
  return (
    <Canvas
      camera={{
        fov: 60,
        near: 0.1,
        far: 3000,
        position: [-30, 20, 0],
      }}
    >
      <ambientLight />
      <pointLight position={[100, 100, 100]} intensity={10} />
      <pointLight position={[-100, -100, -100]} intensity={10} />
      <Suspense fallback={null}>{/* <Ocean /> */}</Suspense>
      <gridHelper args={[1000, 100]} />
      <FlightEnvelope
        kiteParameters={kiteParameters}
        parameters={{
          color: "#f542e3",
          wireframe: true,
          name: "wiredEnvelope",
          widthSegments: 32,
          heightSegments: 16,
        }}
        onMouseClick={handleClickedEnvelope}
      />
      <FlightEnvelope
        kiteParameters={kiteParameters}
        parameters={{
          color: "#f7bef2",
          wireframe: false,
          name: "filledEnvelope",
        }}
        onMouseClick={handleClickedEnvelope}
      />
      <Sky scale={1000} sunPosition={[500, 150, -200]} turbidity={0.1} />
      <BoxyBoat ref={boat} />
      {/* <Boat ref={boat} position={[0, -10, 0]} scale={5} /> */}

      <Float rotationIntensity={0.4} floatIntensity={20} speed={1.5}>
        <Kite
          kiteAttitude={kiteAttitude}
          scale={3}
          rotation={[0, -Math.PI / 2 - degToRad(kiteParameters.azimuth_deg), 0]}
          // ref={kite}
        />
        {/* <Spaceman
          kiteAttitude={kiteAttitude}
          scale={3}
          rotation={[0, -Math.PI / 2 - degToRad(kiteParameters.azimuth_deg), 0]}
        >
          <object3D ref={spaceman} />
        </Spaceman> */}
      </Float>
      {/* <Tether start={boat} end={kite} /> */}
      <OrbitControls makeDefault />
      <Stats />
    </Canvas>
  );
}
