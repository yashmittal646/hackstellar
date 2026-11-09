import { Request, Response, NextFunction } from "express";
import { Return, IReturn } from "../models";
import { AppError } from "../middleware/errorHandler";

// GET /api/returns — List all returns
export async function getAllReturns(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, fraudRisk, routingDestination, page = 1, limit = 20 } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (fraudRisk) filter.fraudRisk = fraudRisk;
    if (routingDestination) filter.routingDestination = routingDestination;

    const returns = await Return.find(filter)
      .populate("userId", "name email")
      .populate("productId", "name category price")
      .populate("assignedHubId", "name city")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Return.countDocuments(filter);

    res.json({
      success: true,
      data: returns,
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

// GET /api/returns/:id — Get a single return
export async function getReturnById(req: Request, res: Response, next: NextFunction) {
  try {
    const returnDoc = await Return.findById(req.params.id)
      .populate("userId", "name email phone address")
      .populate("productId")
      .populate("originalOrderId")
      .populate("matchedOrderId")
      .populate("assignedHubId");

    if (!returnDoc) {
      throw new AppError("Return not found", 404);
    }

    res.json({ success: true, data: returnDoc });
  } catch (error) {
    next(error);
  }
}

// POST /api/returns — Initiate a new return
export async function createReturn(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      originalOrderId,
      userId,
      productId,
      reason,
      reasonCategory,
      pickupAddress,
    } = req.body;

    // Generate return ID
    const returnId = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const conditionImages = req.files
      ? (req.files as Express.Multer.File[]).map((f) => `/uploads/${f.filename}`)
      : [];

    const newReturn = new Return({
      returnId,
      originalOrderId,
      userId,
      productId,
      reason,
      reasonCategory,
      pickupAddress,
      conditionImages,
      status: "initiated",
      timeline: [
        {
          status: "initiated",
          timestamp: new Date(),
          notes: "Return request initiated by customer",
        },
      ],
    });

    await newReturn.save();

    res.status(201).json({
      success: true,
      data: newReturn,
      message: "Return initiated successfully. Processing will begin shortly.",
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/returns/:id/status — Update return status
export async function updateReturnStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, location, notes } = req.body;

    const returnDoc = await Return.findById(req.params.id);
    if (!returnDoc) {
      throw new AppError("Return not found", 404);
    }

    returnDoc.status = status;
    returnDoc.timeline.push({
      status,
      timestamp: new Date(),
      location,
      notes,
    });

    await returnDoc.save();

    res.json({ success: true, data: returnDoc });
  } catch (error) {
    next(error);
  }
}

