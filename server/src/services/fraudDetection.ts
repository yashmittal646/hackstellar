/**
 * Fraud Detection Service
 * Rule-based fraud scoring engine.
 * Evaluates multiple signals and produces a composite fraud score.
 */

import { IReturn, Return, FraudLog } from "../models";

export interface FraudFlag {
  flag: string;
  description: string;
  weight: number;
  triggered: boolean;
}

export interface FraudResult {
  score: number; // 0-100
  risk: "low" | "medium" | "high";
  flags: FraudFlag[];
}

export async function detectFraud(returnDoc: IReturn): Promise<FraudResult> {
  const flags: FraudFlag[] = [];

  // --- Signal 1: Return frequency ---
  const recentReturns = await Return.countDocuments({
    userId: returnDoc.userId,
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  });

  flags.push({
    flag: "high_return_frequency",
    description: `${recentReturns} return(s) in last 30 days`,
    weight: 25,
    triggered: recentReturns > 3,
  });

  // --- Signal 2: High-value item pattern ---
  const productDoc = returnDoc.productId as any;
  const isHighValue = productDoc?.price > 5000;
  const highValueReturns = await Return.countDocuments({
    userId: returnDoc.userId,
  }).then(async (total) => {
    // Simplified: if user has returned many items, flag
    return total > 5;
  });

  flags.push({
    flag: "high_value_pattern",
    description: isHighValue
      ? `High-value item (₹${productDoc?.price || "N/A"})`
      : "Standard value item",
    weight: 20,
    triggered: isHighValue && highValueReturns,
  });

  // --- Signal 3: Account age ---
  const userDoc = returnDoc.userId as any;
  const accountAgeDays = userDoc?.accountCreatedAt
    ? (Date.now() - new Date(userDoc.accountCreatedAt).getTime()) / (1000 * 60 * 60 * 24)
    : 365;

  flags.push({
    flag: "new_account",
    description: `Account age: ${Math.round(accountAgeDays)} days`,
    weight: 15,
    triggered: accountAgeDays < 30,
  });

  // --- Signal 4: Reason consistency ---
  const reasonDamaged = ["damaged", "defective"].includes(returnDoc.reasonCategory);
  const hasImages = returnDoc.conditionImages && returnDoc.conditionImages.length > 0;

  flags.push({
    flag: "reason_inconsistency",
    description: reasonDamaged && !hasImages
      ? "Claims damage/defect but no images provided"
      : "Reason appears consistent",
    weight: 15,
    triggered: reasonDamaged && !hasImages,
  });

  // --- Signal 5: Rapid return ---
  const originalOrder = returnDoc.originalOrderId as any;
  const orderDate = originalOrder?.createdAt
    ? new Date(originalOrder.createdAt)
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const daysSinceOrder = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);

  flags.push({
    flag: "rapid_return",
    description: `Returned ${Math.round(daysSinceOrder)} day(s) after purchase`,
    weight: 10,
    triggered: daysSinceOrder < 1,
  });

  // --- Signal 6: Multiple returns from same address ---
  const addressReturns = await Return.countDocuments({
    "pickupAddress.pincode": returnDoc.pickupAddress?.pincode,
    userId: { $ne: returnDoc.userId },
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  });

  flags.push({
    flag: "address_cluster",
    description: `${addressReturns} other return(s) from same pincode in 30 days`,
    weight: 15,
    triggered: addressReturns > 3,
  });

  // --- Calculate composite score ---
  let score = 0;
  for (const flag of flags) {
    if (flag.triggered) {
      score += flag.weight;
    }
  }
  score = Math.min(100, score);

  // Determine risk level
  let risk: "low" | "medium" | "high";
  if (score <= 30) risk = "low";
  else if (score <= 60) risk = "medium";
  else risk = "high";

  // Save fraud log
  await FraudLog.create({
    returnId: returnDoc._id,
    userId: returnDoc.userId,
    score,
    risk,
    flags,
  });

  return { score, risk, flags };
}

