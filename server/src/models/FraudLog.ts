import mongoose, { Schema, Document } from "mongoose";

export interface IFraudLog extends Document {
  returnId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  score: number;
  risk: "low" | "medium" | "high";
  flags: {
    flag: string;
    description: string;
    weight: number;
    triggered: boolean;
  }[];
  reviewedBy?: string;
  reviewNotes?: string;
  reviewedAt?: Date;
}

const fraudLogSchema = new Schema<IFraudLog>(
  {
    returnId: { type: Schema.Types.ObjectId, ref: "Return", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true },
    risk: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    flags: [
      {
        flag: { type: String, required: true },
        description: { type: String, required: true },
        weight: { type: Number, required: true },
        triggered: { type: Boolean, required: true },
      },
    ],
    reviewedBy: { type: String },
    reviewNotes: { type: String },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export const FraudLog = mongoose.model<IFraudLog>("FraudLog", fraudLogSchema);

