import { VisionQualityResult } from "./visionQualityAgent";
import { FraudSentinelResult } from "./fraudSentinelAgent";
import { findNearbyDemand } from "../services/demandMatcher";
import { 
  haversineDistance, 
  estimateShippingCost, 
  estimateCo2Saved, 
  estimateTimeSaved, 
  CENTRAL_WAREHOUSE 
} from "../services/geoService";
import { Hub } from "../models";

export interface LogisticsDispatcherResult {
  decision: "DIRECT_TO_PEER" | "REGIONAL_HUB_STAGING" | "CENTRAL_WAREHOUSE_DEPOT";
  routingScore: number;
  assignedDestination: {
    name: string;
    type: string;
    distanceKm: number;
    coordinates: { lat: number; lng: number };
  };
  matchedOrderId?: string;
  assignedHubId?: string;
  savings: {
    costSavedINR: number;
    co2SavedKg: number;
    hoursSaved: number;
    distanceAvoidedKm: number;
  };
  chainOfThought: {
    agent: string;
    step: string;
    thought: string;
    timestamp: string;
  }[];
}

export async function runLogisticsDispatcherAgent(
  productId: string,
  pickupCoords: { lat: number; lng: number },
  productWeight: number,
  visionResult: VisionQualityResult,
  fraudResult: FraudSentinelResult
): Promise<LogisticsDispatcherResult> {
  const cot: LogisticsDispatcherResult["chainOfThought"] = [];
  const now = new Date();
  const t = (offsetSec: number) => new Date(now.getTime() + offsetSec * 1000).toISOString();

  cot.push({
    agent: "LogisticsDispatcher-v3",
    step: "1. Spatial Ledger Interrogation",
    thought: `Querying 2dsphere spatial index for active pending demand within 25km radius of pickup [${pickupCoords.lat}, ${pickupCoords.lng}].`,
    timestamp: t(0),
  });

  const distanceToWarehouse = haversineDistance(pickupCoords, CENTRAL_WAREHOUSE);

  // Hard Rule 1: High Fraud Quarantine
  if (fraudResult.verdict === "QUARANTINED_TO_DEPOT") {
    cot.push({
      agent: "LogisticsDispatcher-v3",
      step: "2. Security Override Activated",
      thought: `FraudSentinel flagged item as QUARANTINE. Overriding spatial rerouting. Mandating courier route directly to Central Warehouse.`,
      timestamp: t(1),
    });

    return {
      decision: "CENTRAL_WAREHOUSE_DEPOT",
      routingScore: 10,
      assignedDestination: {
        name: "Delhi NCR Mega Warehouse (Quarantine Depot)",
        type: "CENTRAL_WAREHOUSE",
        distanceKm: Math.round(distanceToWarehouse),
        coordinates: CENTRAL_WAREHOUSE,
      },
      savings: {
        costSavedINR: 0,
        co2SavedKg: 0,
        hoursSaved: 0,
        distanceAvoidedKm: 0,
      },
      chainOfThought: cot,
    };
  }

  // Hard Rule 2: Non-resalable condition
  if (!visionResult.resaleReadiness || visionResult.qualityGrade === "DEFECTIVE") {
    cot.push({
      agent: "LogisticsDispatcher-v3",
      step: "2. Condition Gate Enforced",
      thought: `VisionQualityAgent certified item as DEFECTIVE (${visionResult.overallQualityScore}/100). Resale gate failed. Routing to depot for OEM RMA claim.`,
      timestamp: t(1),
    });

    return {
      decision: "CENTRAL_WAREHOUSE_DEPOT",
      routingScore: 15,
      assignedDestination: {
        name: "Delhi NCR Mega Warehouse (RMA Repair Facility)",
        type: "CENTRAL_WAREHOUSE",
        distanceKm: Math.round(distanceToWarehouse),
        coordinates: CENTRAL_WAREHOUSE,
      },
      savings: {
        costSavedINR: 0,
        co2SavedKg: 0,
        hoursSaved: 0,
        distanceAvoidedKm: 0,
      },
      chainOfThought: cot,
    };
  }

  // Check matching pending orders
  const nearbyDemand = await findNearbyDemand(productId.toString(), pickupCoords, 50);

  if (nearbyDemand.length > 0 && nearbyDemand[0].distance <= 25 && visionResult.qualityGrade === "PRISTINE") {
    const match = nearbyDemand[0];
    const distanceAvoided = Math.max(0, distanceToWarehouse - match.distance);
    const costSaved = estimateShippingCost(distanceAvoided, productWeight);
    const co2Saved = estimateCo2Saved(distanceAvoided);
    const timeSaved = estimateTimeSaved(distanceAvoided);

    cot.push({
      agent: "LogisticsDispatcher-v3",
      step: "2. Peer Demand Match Confirmed",
      thought: `Found 1:1 matching pending order #ORD-${match.order._id.toString().slice(-5)} just ${match.distance.toFixed(1)} km away. Quality certified PRISTINE.`,
      timestamp: t(1),
    });

    cot.push({
      agent: "LogisticsDispatcher-v3",
      step: "3. Direct Peer Dispatch Issued",
      thought: `Issuing dynamic reroute order: Intercept package and deliver directly to peer. Bypassing ${Math.round(distanceToWarehouse)} km warehouse haul. Saving ₹${costSaved.toLocaleString()} and ${timeSaved} hours.`,
      timestamp: t(2),
    });

    return {
      decision: "DIRECT_TO_PEER",
      routingScore: 94,
      assignedDestination: {
        name: `Customer Delivery (Pending Order Match)`,
        type: "PEER_CUSTOMER",
        distanceKm: Math.round(match.distance),
        coordinates: match.order.deliveryAddress.coordinates,
      },
      matchedOrderId: match.order._id.toString(),
      savings: {
        costSavedINR: costSaved,
        co2SavedKg: co2Saved,
        hoursSaved: timeSaved,
        distanceAvoidedKm: Math.round(distanceAvoided),
      },
      chainOfThought: cot,
    };
  }

  // Otherwise, route to regional hub for staging
  const hubs = await Hub.find({ isActive: true });
  let closestHub: any = null;
  let minDistance = Infinity;

  for (const hub of hubs) {
    const dist = haversineDistance(pickupCoords, {
      lat: hub.location.coordinates[1],
      lng: hub.location.coordinates[0],
    });
    if (dist < minDistance) {
      minDistance = dist;
      closestHub = hub;
    }
  }

  const hubDistance = closestHub ? minDistance : distanceToWarehouse;
  const distanceAvoided = Math.max(0, distanceToWarehouse - hubDistance);
  const costSaved = estimateShippingCost(distanceAvoided, productWeight);
  const co2Saved = estimateCo2Saved(distanceAvoided);
  const timeSaved = estimateTimeSaved(distanceAvoided);

  cot.push({
    agent: "LogisticsDispatcher-v3",
    step: "2. Micro-Hub Capacity Allocation",
    thought: `No immediate customer match within 25km. Allocating storage buffer at ${closestHub?.name || "Regional Hub"} (${hubDistance.toFixed(1)} km away). Staging for local demand burst.`,
    timestamp: t(1),
  });

  return {
    decision: "REGIONAL_HUB_STAGING",
    routingScore: 78,
    assignedDestination: {
      name: closestHub?.name || "Regional Micro-Hub",
      type: "REGIONAL_HUB",
      distanceKm: Math.round(hubDistance),
      coordinates: closestHub ? {
        lat: closestHub.location.coordinates[1],
        lng: closestHub.location.coordinates[0],
      } : CENTRAL_WAREHOUSE,
    },
    assignedHubId: closestHub?._id.toString(),
    savings: {
      costSavedINR: costSaved,
      co2SavedKg: co2Saved,
      hoursSaved: timeSaved,
      distanceAvoidedKm: Math.round(distanceAvoided),
    },
    chainOfThought: cot,
  };
}

