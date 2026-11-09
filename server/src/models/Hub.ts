import mongoose, { Schema, Document } from "mongoose";

export interface IHub extends Document {
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  capacity: number;
  currentStock: number;
  isActive: boolean;
}

const hubSchema = new Schema<IHub>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    capacity: { type: Number, required: true },
    currentStock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

hubSchema.index({ location: "2dsphere" });

export const Hub = mongoose.model<IHub>("Hub", hubSchema);

