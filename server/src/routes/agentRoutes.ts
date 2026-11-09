import { Router, Request, Response, NextFunction } from "express";
import { orchestrateReturnQualityAssessment, askAgentCopilot } from "../agents/agentOrchestrator";

const router = Router();

// POST /api/agents/inspect — Run Multi-Agent Quality & Routing Analysis
router.post("/inspect", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      productName = "iPhone 15 Pro Max",
      category = "Electronics",
      price = 159900,
      claimedReason = "Changed my mind, unopened package",
      userId = "demo_user",
      pickupCoords = { lat: 28.5355, lng: 77.391 }, // Noida default
      productWeight = 0.5,
      imageInput,
    } = req.body;

    const dossier = await orchestrateReturnQualityAssessment(
      productName,
      category,
      price,
      claimedReason,
      userId,
      pickupCoords,
      productWeight,
      imageInput
    );

    res.json({
      success: true,
      data: dossier,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/agents/copilot — Ask questions to the AI Agent
router.post("/copilot", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { context, question } = req.body;

    if (!context || !question) {
      res.status(400).json({ success: false, error: "Missing context or question" });
      return;
    }

    const answer = await askAgentCopilot(context, question);
    res.json({ success: true, data: { answer } });
  } catch (error) {
    next(error);
  }
});

export default router;

