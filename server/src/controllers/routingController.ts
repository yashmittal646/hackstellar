import { Request, Response, NextFunction } from "express";
import { Return, Order, Hub, FraudLog } from "../models";
import { routeReturn } from "../services/routingEngine";
import { assessCondition } from "../services/conditionAssessor";
import { detectFraud } from "../services/fraudDetection";

// POST /api/routing/process/:returnId — Process a return through the full autonomous pipeline
export async function processReturn(req: Request, res: Response, next: NextFunction) {
  try {
    const returnDoc = await Return.findById(req.params.returnId)
      .populate("userId")
      .populate("productId")
      .populate("originalOrderId");

    if (!returnDoc) {
      res.status(404).json({ success: false, error: "Return not found" });
      return;
    }

    // Step 1: AI Visual & Condition Assessment
    const conditionResult = assessCondition(returnDoc);
    returnDoc.conditionGrade = conditionResult.grade;
    returnDoc.conditionScore = conditionResult.score;

    // Step 2: Multi-Signal Fraud Detection
    const fraudResult = await detectFraud(returnDoc);
    returnDoc.fraudScore = fraudResult.score;
    returnDoc.fraudFlags = fraudResult.flags.map((f) => f.flag);
    returnDoc.fraudRisk = fraudResult.risk;

    // Step 3: Autonomous Rerouting Engine
    const routingResult = await routeReturn(returnDoc);
    returnDoc.routingDestination = routingResult.destination;
    returnDoc.routingScore = routingResult.score;
    returnDoc.routingReasoning = routingResult.reasoning;
    returnDoc.matchedOrderId = routingResult.matchedOrderId;
    returnDoc.assignedHubId = routingResult.assignedHubId;
    returnDoc.originalDistance = routingResult.originalDistance;
    returnDoc.optimizedDistance = routingResult.optimizedDistance;
    returnDoc.costSaved = routingResult.costSaved;
    returnDoc.co2Saved = routingResult.co2Saved;
    returnDoc.timeSaved = routingResult.timeSaved;

    // Step 4: Closed-Loop Lifecycle State Transitions
    if (routingResult.destination === "direct_to_customer" && routingResult.matchedOrderId) {
      // Mark the waiting customer's pending order as fulfilled by intercept!
      await Order.findByIdAndUpdate(routingResult.matchedOrderId, {
        status: "shipped",
      });
      returnDoc.status = "routed";
      returnDoc.timeline.push({
        status: "routed",
        timestamp: new Date(),
        location: returnDoc.pickupAddress.city,
        notes: `Peer match established! Direct delivery initiated to pending Order ${routingResult.matchedOrderId}. Bypassing Central Warehouse.`,
      });
    } else if (routingResult.destination === "nearby_hub" && routingResult.assignedHubId) {
      // Increment local hub available inventory for regional demand
      await Hub.findByIdAndUpdate(routingResult.assignedHubId, {
        $inc: { currentStock: 1 },
      });
      returnDoc.status = "in_transit";
      returnDoc.timeline.push({
        status: "in_transit",
        timestamp: new Date(),
        location: returnDoc.pickupAddress.city,
        notes: `Routed to regional micro-hub for staging. Stock indexed for rapid dispatch.`,
      });
    } else {
      // High fraud risk or damaged product — quarantine to Central Depot
      returnDoc.status = "routed";
      returnDoc.timeline.push({
        status: "routed",
        timestamp: new Date(),
        location: returnDoc.pickupAddress.city,
        notes: `Product diverted to Delhi Central Warehouse for physical triage & warranty claim validation.`,
      });
    }

    await returnDoc.save();

    res.json({
      success: true,
      data: {
        return: returnDoc,
        conditionResult,
        fraudResult,
        routingResult,
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/routing/explain/:returnId — Get comprehensive routing explanation
export async function getRoutingExplanation(req: Request, res: Response, next: NextFunction) {
  try {
    const returnDoc = await Return.findById(req.params.returnId)
      .populate("matchedOrderId")
      .populate("assignedHubId")
      .populate("productId")
      .populate("userId");

    if (!returnDoc) {
      res.status(404).json({ success: false, error: "Return not found" });
      return;
    }

    const explanation = {
      returnId: returnDoc.returnId,
      destination: returnDoc.routingDestination,
      score: returnDoc.routingScore,
      reasoning: returnDoc.routingReasoning,
      savings: {
        originalDistance: returnDoc.originalDistance,
        optimizedDistance: returnDoc.optimizedDistance,
        costSaved: returnDoc.costSaved,
        co2Saved: returnDoc.co2Saved,
        timeSaved: returnDoc.timeSaved,
      },
      conditionGrade: returnDoc.conditionGrade,
      conditionScore: returnDoc.conditionScore,
      fraudRisk: returnDoc.fraudRisk,
      fraudScore: returnDoc.fraudScore,
      matchedOrder: returnDoc.matchedOrderId,
      assignedHub: returnDoc.assignedHubId,
    };

    res.json({ success: true, data: explanation });
  } catch (error) {
    next(error);
  }
}
