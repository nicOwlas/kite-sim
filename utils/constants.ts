// Physics constants
export const LIFT_COEFFICIENT = 0.776; // LELOUP2013
export const AIR_DENSITY = 1.225; // kg/m³ at sea level, 15°C
export const WIND_GRADIENT_EXPONENT = 1 / 7; // ITTC 2011
export const REFERENCE_HEIGHT = 10; // m, reference height for wind gradient
export const MIN_KITE_HEIGHT = 10; // m, minimum height to avoid zero wind speed
export const GRAVITY = 9.81; // m/s²

// Tether catenary (parabola approximation): max midspan sag as a fraction of the
// straight-line chord length. Clamps the droop when tension → 0 (parked / low wind).
export const CATENARY_MAX_SAG_FRACTION = 0.25;

// Scene configuration
export const POD_POSITION: [number, number, number] = [195, 15, 0];
export const KITE_MODEL_SURFACE = 13.8; // m², surface area of the 3D kite model

export const CAMERA_CONFIG = {
  fov: 60,
  near: 0.1,
  far: 3000,
  position: [100, 50, 80] as [number, number, number],
};

export const ORBIT_TARGET: [number, number, number] = [200, 50, 0];
