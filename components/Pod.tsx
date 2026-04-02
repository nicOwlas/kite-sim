import { Points } from "@react-three/drei";
import { forwardRef } from "react";

const Pod = forwardRef<any, any>((props, ref) => {
  return <Points ref={ref} {...props} />;
});

Pod.displayName = "Pod";

export default Pod;
