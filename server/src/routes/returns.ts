import { Router } from "express";
import {
  getAllReturns,
  getReturnById,
  createReturn,
  updateReturnStatus,
} from "../controllers/returnController";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", getAllReturns);
router.get("/:id", getReturnById);
router.post("/", upload.array("images", 5), createReturn);
router.patch("/:id/status", updateReturnStatus);

export default router;

