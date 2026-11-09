import { Router } from "express";
import {
  getStats,
  getRecentReturns,
  getFraudAlerts,
  reviewFraudAlert,
  getMapData,
} from "../controllers/dashboardController";

const router = Router();

router.get("/stats", getStats);
router.get("/recent-returns", getRecentReturns);
router.get("/fraud-alerts", getFraudAlerts);
router.patch("/fraud-review/:id", reviewFraudAlert);
router.get("/map-data", getMapData);

export default router;
