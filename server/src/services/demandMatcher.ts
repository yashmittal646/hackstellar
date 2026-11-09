/**
 * Demand Matching Service
 * Finds nearby pending/confirmed orders for the same product as the return.
 */

import { Order, IOrder, Product } from "../models";
import { haversineDistance } from "./geoService";

export interface DemandMatch {
  order: IOrder;
  distance: number; // km from return pickup
}

/**
 * Find pending orders for the same product within a given radius.
 * Accepts either a MongoDB ObjectId string or a product name string.
 */
export async function findNearbyDemand(
  productIdOrName: string,
  pickupCoords: { lat: number; lng: number },
  radiusKm: number = 100
): Promise<DemandMatch[]> {
  try {
    // Try to find by ObjectId first; fall back to product name lookup
    let resolvedProductId: string | null = null;

    // Check if it looks like a MongoDB ObjectId (24 hex chars)
    if (/^[a-f\d]{24}$/i.test(productIdOrName)) {
      resolvedProductId = productIdOrName;
    } else {
      // Look up by name
      const product = await Product.findOne({
        name: { $regex: new RegExp(productIdOrName.trim(), "i") },
      }).select("_id");
      if (product) resolvedProductId = product._id.toString();
    }

    if (!resolvedProductId) return []; // No product found — no demand match

    const pendingOrders = await Order.find({
      productId: resolvedProductId,
      status: { $in: ["pending", "confirmed"] },
    }).populate("userId", "name address");

    const matches: DemandMatch[] = [];

    for (const order of pendingOrders) {
      const orderCoords = order.deliveryAddress.coordinates;
      const distance = haversineDistance(pickupCoords, orderCoords);
      if (distance <= radiusKm) {
        matches.push({ order, distance });
      }
    }

    matches.sort((a, b) => a.distance - b.distance);
    return matches;
  } catch {
    // If anything fails (e.g. invalid id cast), return empty — dispatcher will fall back to hub
    return [];
  }
}

