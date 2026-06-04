import type { Vector3 } from "three";

export interface KiteAttitude {
  radius: number;
  azimuth: number;
  elevation: number;
  roll: number;
  pitch: number;
  yaw: number;
}

export interface KiteParameters {
  length_m: number;
  surface_m2: number;
  liftToDrag: number;
  tetherWeight_kgpm: number;
}

export interface WindParameters {
  speed_mps: number;
  direction_deg: number;
}

export interface KiteState {
  position: Vector3;
  velocity: Vector3;
  traction: number;
}

export interface TractionInput {
  apparentWindSpeed: number;
  tetherDirection: Vector3;
  boatForward: Vector3;
  kiteParameters: KiteParameters;
}
