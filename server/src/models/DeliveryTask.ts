import mongoose, { Schema, Document } from "mongoose";

export type TaskType = "RETURN_PICKUP" | "DIRECT_PEER_DELIVERY" | "HUB_DROP";
export type TaskStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "ARRIVED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "FAILED";

export interface IDeliveryTask extends Document {
  taskId: string;
  taskType: TaskType;
  rider: mongoose.Types.ObjectId;
  returnItem?: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  itemDetails: {
    title: string;
    brand: string;
    category: string;
    grade?: string;
    value: number;
    barcode?: string;
  };
  pickupAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    coordinates: { lat: number; lng: number };
  };
  deliveryAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    coordinates: { lat: number; lng: number };
  };
  status: TaskStatus;
  otp: string;
  priority: "HIGH" | "NORMAL" | "EXPRESS";
  sequence: number;
  estimatedMinutes: number;
  distanceKm: number;
  notes?: string;
  completedAt?: Date;
}

const deliveryTaskSchema = new Schema<IDeliveryTask>(
  {
    taskId: { type: String, required: true, unique: true },
    taskType: {
      type: String,
      enum: ["RETURN_PICKUP", "DIRECT_PEER_DELIVERY", "HUB_DROP"],
      required: true,
    },
    rider: { type: Schema.Types.ObjectId, ref: "Rider", required: true },
    returnItem: { type: Schema.Types.ObjectId, ref: "Return" },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    itemDetails: {
      title: { type: String, required: true },
      brand: { type: String, default: "" },
      category: { type: String, default: "" },
      grade: { type: String, default: "PRISTINE" },
      value: { type: Number, default: 0 },
      barcode: { type: String, default: "" },
    },
    pickupAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    deliveryAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    status: {
      type: String,
      enum: [
        "ASSIGNED",
        "ACCEPTED",
        "ARRIVED",
        "PICKED_UP",
        "IN_TRANSIT",
        "DELIVERED",
        "FAILED",
      ],
      default: "ASSIGNED",
    },
    otp: { type: String, required: true, default: "4821" },
    priority: {
      type: String,
      enum: ["HIGH", "NORMAL", "EXPRESS"],
      default: "NORMAL",
    },
    sequence: { type: Number, default: 1 },
    estimatedMinutes: { type: Number, default: 15 },
    distanceKm: { type: Number, default: 3.2 },
    notes: { type: String, default: "" },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

deliveryTaskSchema.index({ rider: 1, status: 1 });

export const DeliveryTask = mongoose.model<IDeliveryTask>(
  "DeliveryTask",
  deliveryTaskSchema
);
