import { forwardRef } from "react";
const BoxyBoat = forwardRef(({ children, ...props }, ref) => {
  return (
    <mesh position={[0, 0, 0]} ref={ref}>
      <meshNormalMaterial wireframe={true} />
      <axesHelper scale={30} />
      <boxGeometry args={[100, 15, 30]} />
    </mesh>
  );
});

BoxyBoat.displayName = "BoxyBoat";

export default BoxyBoat;
