import mongoose, { Schema, Document } from "mongoose";

export type ReturnStatus =
  | "initiated"
  | "picked_up"
  | "in_transit"
  | "condition_check"
  | "routed"
  | "out_for_delivery"
  | "delivered"
  | "warehouse_received"
  | "frozen"
  | "rejected";

export type RoutingDestination = "direct_to_customer" | "nearby_hub" | "central_warehouse";

export type ConditionGrade = "pristine" | "good" | "fair" | "damaged" | "defective";

export interface IReturn extends Document {
  returnId: string;
  originalOrderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  reason: string;
  reasonCategory:
    | "wrong_item"
    | "damaged"
    | "not_as_described"
    | "changed_mind"
    | "defective"
    | "size_issue"
    | "other";
  status: ReturnStatus;
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };

  // Condition Assessment
  conditionImages: string[];
  conditionGrade: ConditionGrade;
  conditionScore: number; // 0-100

  // Fraud Detection
  fraudScore: number; // 0-100
  fraudFlags: string[];
  fraudRisk: "low" | "medium" | "high";

  // Routing Decision
  routingDestination: RoutingDestination;
  routingScore: number;
  routingReasoning: {
    conditionFactor: number;
    demandFactor: number;
    fraudFactor: number;
    proximityFactor: number;
    timeSavingsFactor: number;
  };
  matchedOrderId?: mongoose.Types.ObjectId;
  assignedHubId?: mongoose.Types.ObjectId;

  // Cost Savings
  originalDistance: number; // km to warehouse
  optimizedDistance: number; // km to destination
  costSaved: number; // in INR
  co2Saved: number; // in kg
  timeSaved: number; // in hours

  // Tracking
  timeline: {
    status: ReturnStatus;
    timestamp: Date;
    location?: string;
    notes?: string;
  }[];
}

const returnSchema = new Schema<IReturn>(
  {
    returnId: { type: String, required: true, unique: true },
    originalOrderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    reason: { type: String, required: true },
    reasonCategory: {
      type: String,
      enum: [
        "wrong_item",
        "damaged",
        "not_as_described",
        "changed_mind",
        "defective",
        "size_issue",
        "other",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "initiated",
        "picked_up",
        "in_transit",
        "condition_check",
        "routed",
        "out_for_delivery",
        "delivered",
        "warehouse_received",
        "frozen",
        "rejected",
      ],
      default: "initiated",
    },
    pickupAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },

    // Condition
    conditionImages: [{ type: String }],
    conditionGrade: {
      type: String,
      enum: ["pristine", "good", "fair", "damaged", "defective"],
      default: "good",
    },
    conditionScore: { type: Number, default: 0 },

    // Fraud
    fraudScore: { type: Number, default: 0 },
    fraudFlags: [{ type: String }],
    fraudRisk: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },

    // Routing
    routingDestination: {
      type: String,
      enum: ["direct_to_customer", "nearby_hub", "central_warehouse"],
    },
    routingScore: { type: Number, default: 0 },
    routingReasoning: {
      conditionFactor: { type: Number, default: 0 },
      demandFactor: { type: Number, default: 0 },
      fraudFactor: { type: Number, default: 0 },
      proximityFactor: { type: Number, default: 0 },
      timeSavingsFactor: { type: Number, default: 0 },
    },
    matchedOrderId: { type: Schema.Types.ObjectId, ref: "Order" },
    assignedHubId: { type: Schema.Types.ObjectId, ref: "Hub" },

    // Savings
    originalDistance: { type: Number, default: 0 },
    optimizedDistance: { type: Number, default: 0 },
    costSaved: { type: Number, default: 0 },
    co2Saved: { type: Number, default: 0 },
    timeSaved: { type: Number, default: 0 },

    // Timeline
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        location: { type: String },
        notes: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const Return = mongoose.model<IReturn>("Return", returnSchema);

