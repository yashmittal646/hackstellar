/**
 * Smart Routing Engine — The Core Brain
 *
 * Determines the optimal destination for a returned product:
 *   1. Direct to another customer (best case)
 *   2. Nearby hub (store for future demand)
 *   3. Central warehouse (last resort)
 *
 * Uses a weighted scoring formula:
 *   S = w1*Condition + w2*Demand + w3*(1-Fraud) + w4*Proximity + w5*TimeSavings
 */

import mongoose from "mongoose";
import { IReturn, RoutingDestination, Hub } from "../models";
import { findNearbyDemand } from "./demandMatcher";
import {
  haversineDistance,
  estimateShippingCost,
  estimateCo2Saved,
  estimateTimeSaved,
  CENTRAL_WAREHOUSE,
} from "./geoService";

// Weights for routing score
const WEIGHTS = {
  condition: 0.25,
  demand: 0.30,
  fraud: 0.20,
  proximity: 0.15,
  timeSavings: 0.10,
};

export interface RoutingResult {
  destination: RoutingDestination;
  score: number;
  reasoning: {
    conditionFactor: number;
    demandFactor: number;
    fraudFactor: number;
    proximityFactor: number;
    timeSavingsFactor: number;
  };
  matchedOrderId?: mongoose.Types.ObjectId;
  assignedHubId?: mongoose.Types.ObjectId;
  originalDistance: number;
  optimizedDistance: number;
  costSaved: number;
  co2Saved: number;
  timeSaved: number;
}

export async function routeReturn(returnDoc: IReturn): Promise<RoutingResult> {
  const pickupCoords = returnDoc.pickupAddress.coordinates;
  const productId = (returnDoc.productId as any)._id || returnDoc.productId;

  // --- Calculate distance to central warehouse ---
  const distanceToWarehouse = haversineDistance(pickupCoords, CENTRAL_WAREHOUSE);

  // --- Hard rules: skip scoring if clearly warehouse-bound ---
  if (returnDoc.fraudRisk === "high") {
    return buildWarehouseResult(returnDoc, distanceToWarehouse, "High fraud risk — requires inspection");
  }

  if (returnDoc.conditionScore < 30) {
    return buildWarehouseResult(returnDoc, distanceToWarehouse, "Product condition too poor for resale");
  }

  // --- Factor 1: Condition (0-1) ---
  const conditionFactor = returnDoc.conditionScore / 100;

  // --- Factor 2: Demand (0-1) ---
  const nearbyDemand = await findNearbyDemand(
    productId.toString(),
    pickupCoords,
    100 // 100km radius
  );
  const demandFactor = nearbyDemand.length > 0
    ? Math.min(1, nearbyDemand.length * 0.3 + 0.4)
    : 0;

  // --- Factor 3: Fraud (inverted, 0-1, higher = safer) ---
  const fraudFactor = 1 - returnDoc.fraudScore / 100;

  // --- Factor 4: Proximity (0-1) ---
  let proximityFactor = 0;
  let closestDistance = distanceToWarehouse;

  if (nearbyDemand.length > 0) {
    closestDistance = nearbyDemand[0].distance;
    proximityFactor = Math.max(0, 1 - closestDistance / 100); // Normalize: 0km=1, 100km=0
  }

  // --- Factor 5: Time savings (0-1) ---
  const timeSavingsFactor = Math.min(1, (distanceToWarehouse - closestDistance) / distanceToWarehouse);

  // --- Compute routing score ---
  const score =
    WEIGHTS.condition * conditionFactor +
    WEIGHTS.demand * demandFactor +
    WEIGHTS.fraud * fraudFactor +
    WEIGHTS.proximity * proximityFactor +
    WEIGHTS.timeSavings * timeSavingsFactor;

  const normalizedScore = score * 100;

  const reasoning = {
    conditionFactor: parseFloat(conditionFactor.toFixed(3)),
    demandFactor: parseFloat(demandFactor.toFixed(3)),
    fraudFactor: parseFloat(fraudFactor.toFixed(3)),
    proximityFactor: parseFloat(proximityFactor.toFixed(3)),
    timeSavingsFactor: parseFloat(timeSavingsFactor.toFixed(3)),
  };

  // --- Determine destination ---
  let destination: RoutingDestination;
  let matchedOrderId: mongoose.Types.ObjectId | undefined;
  let assignedHubId: mongoose.Types.ObjectId | undefined;
  let optimizedDistance: number;

  if (nearbyDemand.length > 0 && nearbyDemand[0].distance < 25 && normalizedScore >= 60) {
    // Direct to customer
    destination = "direct_to_customer";
    matchedOrderId = nearbyDemand[0].order._id as mongoose.Types.ObjectId;
    optimizedDistance = nearbyDemand[0].distance;
  } else if (normalizedScore >= 40) {
    // Route to nearest hub
    destination = "nearby_hub";
    const nearestHub = await findNearestHub(pickupCoords);
    if (nearestHub) {
      assignedHubId = nearestHub._id as mongoose.Types.ObjectId;
      optimizedDistance = haversineDistance(pickupCoords, {
        lat: nearestHub.location.coordinates[1],
        lng: nearestHub.location.coordinates[0],
      });
    } else {
      // No hub found, fall back to warehouse
      destination = "central_warehouse";
      optimizedDistance = distanceToWarehouse;
    }
  } else {
    destination = "central_warehouse";
    optimizedDistance = distanceToWarehouse;
  }

  const distanceSaved = Math.max(0, distanceToWarehouse - optimizedDistance);
  const productWeight = (returnDoc.productId as any)?.weight || 1;

  return {
    destination,
    score: parseFloat(normalizedScore.toFixed(1)),
    reasoning,
    matchedOrderId,
    assignedHubId,
    originalDistance: Math.round(distanceToWarehouse),
    optimizedDistance: Math.round(optimizedDistance),
    costSaved: estimateShippingCost(distanceSaved, productWeight),
    co2Saved: estimateCo2Saved(distanceSaved),
    timeSaved: estimateTimeSaved(distanceSaved),
  };
}

function buildWarehouseResult(
  returnDoc: IReturn,
  distanceToWarehouse: number,
  _reason: string
): RoutingResult {
  return {
    destination: "central_warehouse",
    score: 0,
    reasoning: {
      conditionFactor: returnDoc.conditionScore / 100,
      demandFactor: 0,
      fraudFactor: 1 - returnDoc.fraudScore / 100,
      proximityFactor: 0,
      timeSavingsFactor: 0,
    },
    originalDistance: Math.round(distanceToWarehouse),
    optimizedDistance: Math.round(distanceToWarehouse),
    costSaved: 0,
    co2Saved: 0,
    timeSaved: 0,
  };
}

async function findNearestHub(coords: { lat: number; lng: number }) {
  const hub = await Hub.findOne({
    isActive: true,
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [coords.lng, coords.lat],
        },
        $maxDistance: 100000, // 100km in meters
      },
    },
  });
  return hub;
}

