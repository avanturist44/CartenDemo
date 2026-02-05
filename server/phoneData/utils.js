import { CONVERSIONS, THRESHOLDS } from './constants.js';

export function mpsToMph(mps) {
  return (mps || 0) * CONVERSIONS.MPS_TO_MPH;
}

export function calculateDistance(pointA, pointB) {
  if (!pointA || !pointB) return 0;
  if (!pointA.lat || !pointA.lng || !pointB.lat || !pointB.lng) return 0;

  const R = CONVERSIONS.EARTH_RADIUS_METERS;
  const lat1Rad = degreesToRadians(pointA.lat);
  const lat2Rad = degreesToRadians(pointB.lat);
  const deltaLat = degreesToRadians(pointB.lat - pointA.lat);
  const deltaLng = degreesToRadians(pointB.lng - pointA.lng);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

export function isGyroMoving(gyroData) {
  if (!gyroData) return false;
  const threshold = THRESHOLDS.GYRO_MOVEMENT;
  return (
    Math.abs(gyroData.x) > threshold ||
    Math.abs(gyroData.y) > threshold ||
    Math.abs(gyroData.z) > threshold
  );
}

export function isAccelStationary(accelData) {
  if (!accelData) return true;
  const magnitude = Math.sqrt(
    accelData.x * accelData.x +
    accelData.y * accelData.y +
    accelData.z * accelData.z
  );
  return magnitude < THRESHOLDS.ACCEL_STATIONARY;
}

export function shallowCopy(obj) {
  if (!obj) return null;
  return { ...obj };
}

export function formatCoordinates(lat, lng, precision = 4) {
  if (lat == null || lng == null) return 'unknown';
  return `[${lat.toFixed(precision)}, ${lng.toFixed(precision)}]`;
}
