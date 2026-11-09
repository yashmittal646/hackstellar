/**
 * Demand Matching Service
 * Finds nearby pending/confirmed orders for the same product as the return.
 */

import { Order, IOrder } from "../models";
import { haversineDistance } from "./geoService";

export interface DemandMatch {
  order: IOrder;
  distance: number; // km from return pickup
}

/**
 * Find pending orders for the same product within a given radius
 */
export async function findNearbyDemand(
  productId: string,
  pickupCoords: { lat: number; lng: number },
  radiusKm: number = 100
): Promise<DemandMatch[]> {
  // Find all pending/confirmed orders for this product
  const pendingOrders = await Order.find({
    productId,
    status: { $in: ["pending", "confirmed"] },
  }).populate("userId", "name address");

  // Filter by distance and sort by proximity
  const matches: DemandMatch[] = [];

  for (const order of pendingOrders) {
    const orderCoords = order.deliveryAddress.coordinates;
    const distance = haversineDistance(pickupCoords, orderCoords);

    if (distance <= radiusKm) {
      matches.push({ order, distance });
    }
  }

  // Sort by closest first
  matches.sort((a, b) => a.distance - b.distance);

  return matches;
}

