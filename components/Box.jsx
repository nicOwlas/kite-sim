import { forwardRef } from "react";
const Boat = forwardRef(({ children, ...props }, ref) => {
  return (
    <mesh position={[0, 0, 0]} ref={ref}>
      <meshNormalMaterial wireframe={true} />
      <axesHelper scale={30} />
      <boxGeometry args={[100, 15, 30]} />
    </mesh>
  );
});

Boat.displayName = "Boat";

export default Boat;
