import { Router } from "express";
import {
  processReturn,
  getRoutingExplanation,
} from "../controllers/routingController";

const router = Router();

router.post("/process/:returnId", processReturn);
router.get("/explain/:returnId", getRoutingExplanation);

export default router;

