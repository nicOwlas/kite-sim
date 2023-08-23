function SampleComponent(props) {
  return (
    <mesh position={[0, 0, -2]}>
      <meshNormalMaterial color="blue" />
      <sphereGeometry args={[2, 32, 16]} />
    </mesh>
  );
}

export default SampleComponent;
