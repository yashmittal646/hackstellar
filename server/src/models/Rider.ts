import mongoose, { Schema, Document } from "mongoose";

export interface IRider extends Document {
  name: string;
  riderId: string;
  phone: string;
  email: string;
  avatar?: string;
  vehicle: {
    type: "EV_2W" | "EV_3W" | "VAN";
    plateNumber: string;
    model: string;
    batteryLevel: number;
  };
  assignedHub: {
    hubId?: mongoose.Types.ObjectId;
    name: string;
    city: string;
  };
  currentLocation: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: "ON_DUTY" | "BUSY" | "BREAK" | "OFF_DUTY";
  shiftStats: {
    completedToday: number;
    rating: number;
    totalDeliveries: number;
    activeTasks: number;
  };
}

const riderSchema = new Schema<IRider>(
  {
    name: { type: String, required: true },
    riderId: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String, default: "" },
    vehicle: {
      type: { type: String, enum: ["EV_2W", "EV_3W", "VAN"], default: "EV_2W" },
      plateNumber: { type: String, required: true },
      model: { type: String, default: "Ather 450X EV" },
      batteryLevel: { type: Number, default: 85, min: 0, max: 100 },
    },
    assignedHub: {
      hubId: { type: Schema.Types.ObjectId, ref: "Hub" },
      name: { type: String, required: true, default: "Delhi NCR Micro-Hub" },
      city: { type: String, required: true, default: "Delhi" },
    },
    currentLocation: {
      lat: { type: Number, required: true, default: 28.6139 },
      lng: { type: Number, required: true, default: 77.209 },
      address: { type: String, default: "Connaught Place, New Delhi" },
    },
    status: {
      type: String,
      enum: ["ON_DUTY", "BUSY", "BREAK", "OFF_DUTY"],
      default: "ON_DUTY",
    },
    shiftStats: {
      completedToday: { type: Number, default: 0 },
      rating: { type: Number, default: 4.9 },
      totalDeliveries: { type: Number, default: 0 },
      activeTasks: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

riderSchema.index({ "currentLocation.lat": 1, "currentLocation.lng": 1 });

export const Rider = mongoose.model<IRider>("Rider", riderSchema);

