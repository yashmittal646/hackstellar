import { Request, Response, NextFunction } from "express";
import { Return, Order, FraudLog, Hub } from "../models";
import { routeReturn } from "../services/routingEngine";

// GET /api/dashboard/stats — Aggregated statistics
export async function getStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const [totalReturns, activeReturns, routingBreakdown, fraudBreakdown, savingsAgg] =
      await Promise.all([
        Return.countDocuments(),
        Return.countDocuments({
          status: { $nin: ["delivered", "warehouse_received"] },
        }),
        Return.aggregate([
          { $group: { _id: "$routingDestination", count: { $sum: 1 } } },
        ]),
        Return.aggregate([
          { $group: { _id: "$fraudRisk", count: { $sum: 1 } } },
        ]),
        Return.aggregate([
          {
            $group: {
              _id: null,
              totalCostSaved: { $sum: "$costSaved" },
              totalCo2Saved: { $sum: "$co2Saved" },
              totalTimeSaved: { $sum: "$timeSaved" },
              avgConditionScore: { $avg: "$conditionScore" },
              totalOriginalDistance: { $sum: "$originalDistance" },
              totalOptimizedDistance: { $sum: "$optimizedDistance" },
            },
          },
        ]),
      ]);

    const totalOrders = await Order.countDocuments();
    const totalFraudAlerts = await FraudLog.countDocuments({ risk: "high" });
    const totalHubs = await Hub.countDocuments({ isActive: true });

    const savings = savingsAgg[0] || {
      totalCostSaved: 0,
      totalCo2Saved: 0,
      totalTimeSaved: 0,
      avgConditionScore: 0,
      totalOriginalDistance: 0,
      totalOptimizedDistance: 0,
    };

    res.json({
      success: true,
      data: {
        totalReturns,
        activeReturns,
        totalOrders,
        totalHubs,
        totalFraudAlerts,
        routingBreakdown: Object.fromEntries(
          routingBreakdown.map((r: any) => [r._id || "unrouted", r.count])
        ),
        fraudBreakdown: Object.fromEntries(
          fraudBreakdown.map((f: any) => [f._id || "unknown", f.count])
        ),
        savings: {
          totalCostSaved: Math.round(savings.totalCostSaved),
          totalCo2Saved: parseFloat(savings.totalCo2Saved.toFixed(2)),
          totalTimeSaved: parseFloat(savings.totalTimeSaved.toFixed(1)),
          avgConditionScore: Math.round(savings.avgConditionScore),
          distanceSaved: Math.round(
            savings.totalOriginalDistance - savings.totalOptimizedDistance
          ),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/dashboard/recent-returns — Last 10 returns with details
export async function getRecentReturns(_req: Request, res: Response, next: NextFunction) {
  try {
    const returns = await Return.find()
      .populate("userId", "name email")
      .populate("productId", "name category price")
      .populate("assignedHubId", "name city")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, data: returns });
  } catch (error) {
    next(error);
  }
}

// GET /api/dashboard/fraud-alerts — High risk returns
export async function getFraudAlerts(_req: Request, res: Response, next: NextFunction) {
  try {
    const alerts = await FraudLog.find()
      .populate({
        path: "returnId",
        populate: [
          { path: "userId", select: "name email" },
          { path: "productId", select: "name price" },
        ],
      })
      .sort({ score: -1, createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/dashboard/fraud-review/:id — Review and override a fraud decision
export async function reviewFraudAlert(req: Request, res: Response, next: NextFunction) {
  try {
    const { action, notes, reviewer = "Admin" } = req.body;
    const fraudLog = await FraudLog.findById(req.params.id);
    if (!fraudLog) {
      res.status(404).json({ success: false, error: "Fraud log not found" });
      return;
    }

    fraudLog.reviewedBy = reviewer;
    fraudLog.reviewNotes = notes;
    fraudLog.reviewedAt = new Date();

    const returnDoc = await Return.findById(fraudLog.returnId).populate("productId");
    if (!returnDoc) {
      res.status(404).json({ success: false, error: "Return not found" });
      return;
    }

    if (action === "approve") {
      // Clear flag as false positive and recalculate local reroute!
      returnDoc.fraudRisk = "low";
      returnDoc.fraudScore = 15;
      const reroute = await routeReturn(returnDoc);
      returnDoc.routingDestination = reroute.destination;
      returnDoc.routingScore = reroute.score;
      returnDoc.costSaved = reroute.costSaved;
      returnDoc.co2Saved = reroute.co2Saved;
      returnDoc.timeSaved = reroute.timeSaved;
      returnDoc.timeline.push({
        status: "routed",
        timestamp: new Date(),
        notes: `Admin approved return after verification. Rerouted to ${reroute.destination.replace(/_/g, " ")}.`,
      });
      await returnDoc.save();
      fraudLog.risk = "low";
    } else {
      // Confirm quarantine
      returnDoc.routingDestination = "central_warehouse";
      returnDoc.timeline.push({
        status: "routed",
        timestamp: new Date(),
        notes: `Admin confirmed quarantine. Retained for depot inspection.`,
      });
      await returnDoc.save();
    }

    await fraudLog.save();

    res.json({ success: true, data: { fraudLog, return: returnDoc } });
  } catch (error) {
    next(error);
  }
}

// GET /api/dashboard/map-data — Data for map visualization
export async function getMapData(_req: Request, res: Response, next: NextFunction) {
  try {
    const [hubs, activeReturns] = await Promise.all([
      Hub.find({ isActive: true }),
      Return.find({ status: { $nin: ["delivered", "warehouse_received"] } })
        .populate("userId", "name address")
        .populate("productId", "name")
        .populate("matchedOrderId", "deliveryAddress")
        .populate("assignedHubId", "name location"),
    ]);

    res.json({
      success: true,
      data: { hubs, activeReturns },
    });
  } catch (error) {
    next(error);
  }
}
