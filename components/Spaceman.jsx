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
    props.kitePosition.radius,
    Math.PI / 2 - props.kitePosition.elevation,
    -props.kitePosition.azimuth + Math.PI / 2
  );
  // props.position

  return (
    <mesh
      castShadow
      receiveShadow
      ref={ref}
      position={position}
      {...props}
      geometry={nodes.Astronaut_mesh.geometry}
      material={materials.Astronaut_mat}
      material-envMapIntensity={0}
      dispose={null}
    >
      <meshNormalMaterial wireframe={true} />
      <axesHelper scale={5} />
      {children}
    </mesh>
  );
});

Spaceman.displayName = "Spaceman";

export default Spaceman;
