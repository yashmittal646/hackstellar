import { Request, Response, NextFunction } from "express";
import { Order } from "../models";

// GET /api/orders — List orders (with optional filters)
export async function getAllOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter: any = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate("userId", "name email")
      .populate("productId", "name category price")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/orders/:id
export async function getOrderById(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId")
      .populate("productId");

    if (!order) {
      res.status(404).json({ success: false, error: "Order not found" });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

// GET /api/orders/pending-by-product/:productId — Find pending orders for a product
export async function getPendingOrdersByProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await Order.find({
      productId: req.params.productId,
      status: { $in: ["pending", "confirmed"] },
    })
      .populate("userId", "name address")
      .sort({ createdAt: 1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
}

