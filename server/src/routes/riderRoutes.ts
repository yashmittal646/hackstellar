import { Router } from "express";
import {
  getRiders,
  getCurrentRider,
  getRiderById,
  updateRiderProfile,
  updateRiderStatus,
  getRiderTasks,
  updateTaskStatus,
} from "../controllers/riderController";

const router = Router();

router.get("/", getRiders);
router.get("/current", getCurrentRider);
router.get("/:id", getRiderById);
router.patch("/:id", updateRiderProfile);
router.patch("/:id/status", updateRiderStatus);
router.get("/:id/tasks", getRiderTasks);

// Task status update
router.patch("/tasks/:id/status", updateTaskStatus);

export default router;

