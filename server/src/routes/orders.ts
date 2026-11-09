import { Router } from "express";
import {
  getAllOrders,
  getOrderById,
  getPendingOrdersByProduct,
} from "../controllers/orderController";

const router = Router();

router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.get("/pending-by-product/:productId", getPendingOrdersByProduct);

export default router;

