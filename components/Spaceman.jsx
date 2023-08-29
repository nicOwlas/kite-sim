import { useGLTF } from "@react-three/drei";
import { forwardRef, useLayoutEffect } from "react";
import { Vector3 } from "three";

const Spaceman = forwardRef(({ children, ...props }, ref) => {
  const { nodes, materials } = useGLTF("/Astronaut-transformed.glb");
  useLayoutEffect(() => {
    Object.values(materials).forEach((material) => {
      material.roughness = 0;
    });
  }, []);
  const position = new Vector3().setFromSphericalCoords(
    props.kiteAttitude.radius,
    Math.PI / 2 - props.kiteAttitude.elevation,
    -props.kiteAttitude.azimuth + Math.PI / 2
  );

  // const rotation = [0, -Math.PI / 2 - props.kiteAttitude.yaw, 0];
  // props.position

  return (
    <mesh
      castShadow
      receiveShadow
      ref={ref}
      position={position}
      // rotation={rotation}
      {...props}
      geometry={nodes.Astronaut_mesh.geometry}
      material={materials.Astronaut_mat}
      material-envMapIntensity={0}
      dispose={null}
    >
      {/* <meshNormalMaterial wireframe={true} /> */}
      <axesHelper scale={5} />
      {children}
    </mesh>
  );
});

Spaceman.displayName = "Spaceman";

export default Spaceman;
