"use client";
import Boat from "@/components/Boat";
import FlightEnvelope from "@/components/FlightEnvelope";
import Kite from "@/components/Kite";
import Ocean from "@/components/Ocean";
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
    azimuth_deg: {
      value: 0,
      min: -180,
      max: 180,
      step: 1,
      // onChange: (azimuth_deg) => {
      //   setKiteAttitude((previousValue) => ({
      //     ...previousValue,
      //     yaw: degToRad(azimuth_deg),
      //   }));
      // },
    },
  });

  // const [kiteParameters2, set] = useControls(() => ({
  //   position: {
  //     value: { x: 0, y: 0 },
  //     onChange: (position) => {
  //       if (circleRef.current) {
  //         circleRef.current.style.transform = `translate(${position.x}px, ${position.y}px)`;
  //       }
  //     },
  //   },
  // }));

  const boatParameters = useControls("Boat", {
    speed_kt: { value: 10, min: 0, max: 50, step: 1 },
    showOcean: true,
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
        roll: degToRad(30),
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
      {boatParameters.showOcean ? (
        <Suspense fallback={null}>
          <Ocean />
        </Suspense>
      ) : (
        <gridHelper args={[1000, 100]} />
      )}
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
      {/* <BoxyBoat ref={boat} /> */}
      <Boat ref={boat} position={[0, -10, 0]} scale={5} />

      <Float rotationIntensity={0.4} floatIntensity={20} speed={1.5}>
        <Kite
          kiteAttitude={kiteAttitude}
          scale={3}
          yaw={degToRad(kiteParameters.azimuth_deg)}
          // rotation={[0, -Math.PI / 2 - degToRad(kiteParameters.azimuth_deg), 0]}
          ref={kite}
        />
      </Float>
      {/* <Tether start={boat} end={kite} /> */}
      <OrbitControls makeDefault />
      <Stats />
    </Canvas>
  );
}
