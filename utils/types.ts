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
}

export interface WindParameters {
  speed_kt: number;
  direction_deg: number;
}

export interface TractionInput {
  kiteAttitude: KiteAttitude;
  kiteParameters: KiteParameters;
  windParameters: WindParameters;
}
