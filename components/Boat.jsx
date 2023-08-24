import { forwardRef } from "react";
const Boat = forwardRef(({ children, ...props }, ref) => {
  return (
    <mesh position={[0, 0, 0]} ref={ref}>
      <meshNormalMaterial wireframe={true} />
      <axesHelper scale={30} />
      <boxGeometry args={[100, 30, 15]} />
    </mesh>
  );
});

export default Boat;
