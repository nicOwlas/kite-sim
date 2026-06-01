declare module "*.css" {}

import type { Object3DNode, ThreeElements } from "@react-three/fiber";
import type { Water } from "three-stdlib";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      water: Object3DNode<Water, typeof Water>;
    }
  }
}
