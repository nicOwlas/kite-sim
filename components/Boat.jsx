function Boat(props) {
  return (
    <mesh position={[0, 0, 0]}>
      <meshNormalMaterial color="blue" />
      <boxGeometry args={[100, 30, 15]} />
    </mesh>
  );
}

export default Boat;
