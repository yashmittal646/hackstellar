/**
 * Geo Service — Distance and proximity calculations
 * Uses Haversine formula for accurate distances between coordinates
 */

interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Calculate the distance between two points using the Haversine formula
 * @returns Distance in kilometers
 */
export function haversineDistance(point1: Coordinates, point2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Estimate shipping cost based on distance and weight
 * @param distanceKm Distance in kilometers
 * @param weightKg Weight in kilograms
 * @returns Estimated cost in INR
 */
export function estimateShippingCost(distanceKm: number, weightKg: number = 1): number {
  const baseCost = 40; // INR
  const perKmRate = 2.5; // INR per km
  const weightMultiplier = 1 + (weightKg - 1) * 0.3;
  return Math.round((baseCost + distanceKm * perKmRate) * weightMultiplier);
}

/**
 * Estimate CO2 emissions saved
 * @param distanceSavedKm Distance saved in kilometers
 * @returns CO2 saved in kg
 */
export function estimateCo2Saved(distanceSavedKm: number): number {
  const co2PerKm = 0.21; // kg CO2 per km for a delivery truck
  return parseFloat((distanceSavedKm * co2PerKm).toFixed(2));
}

/**
 * Estimate time saved based on distance difference
 * @param distanceSavedKm Distance saved in kilometers
 * @returns Time saved in hours
 */
export function estimateTimeSaved(distanceSavedKm: number): number {
  const avgSpeedKmh = 40; // Average delivery speed in city/highway mix
  return parseFloat((distanceSavedKm / avgSpeedKmh).toFixed(1));
}

// Central warehouse location (Delhi NCR for demo)
export const CENTRAL_WAREHOUSE: Coordinates = {
  lat: 28.4595,
  lng: 77.0266,
};

