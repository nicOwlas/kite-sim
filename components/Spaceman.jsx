import { useGLTF } from "@react-three/drei";
import { forwardRef, useLayoutEffect } from "react";
const Spaceman = forwardRef(({ children, ...props }, ref) => {
  const { nodes, materials } = useGLTF("/Astronaut-transformed.glb");
  useLayoutEffect(() => {
    Object.values(materials).forEach((material) => {
      material.roughness = 0;
    });
  }, []);
  return (
    <mesh
      castShadow
      receiveShadow
      ref={ref}
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
