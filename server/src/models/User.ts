import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  accountCreatedAt: Date;
  totalOrders: number;
  totalReturns: number;
  fraudScore: number;
  role: "customer" | "admin";
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    accountCreatedAt: { type: Date, default: Date.now },
    totalOrders: { type: Number, default: 0 },
    totalReturns: { type: Number, default: 0 },
    fraudScore: { type: Number, default: 0 },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
  },
  { timestamps: true }
);

// 2dsphere index for geo queries
userSchema.index({
  "address.coordinates.lat": 1,
  "address.coordinates.lng": 1,
});

export const User = mongoose.model<IUser>("User", userSchema);

