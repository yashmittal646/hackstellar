/**
 * Seed Data Generator
 * Populates MongoDB with realistic demo data for hackathon presentation.
 * Uses real Indian cities, coordinates, products, and realistic return scenarios.
 *
 * Run: npm run seed
 */

import mongoose from "mongoose";
import { config } from "../config/env";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { Hub } from "../models/Hub";
import { Order } from "../models/Order";
import { Return } from "../models/Return";
import { FraudLog } from "../models/FraudLog";

// ============================================================
// DATA: Indian Cities with coordinates
// ============================================================
const CITIES = [
  { city: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777, pincodes: ["400001", "400050", "400070", "400093"] },
  { city: "Delhi", state: "Delhi", lat: 28.7041, lng: 77.1025, pincodes: ["110001", "110025", "110044", "110085"] },
  { city: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946, pincodes: ["560001", "560034", "560066", "560100"] },
  { city: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867, pincodes: ["500001", "500034", "500072", "500081"] },
  { city: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, pincodes: ["600001", "600028", "600040", "600096"] },
  { city: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, pincodes: ["411001", "411014", "411038", "411057"] },
  { city: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, pincodes: ["302001", "302015", "302020", "302033"] },
  { city: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, pincodes: ["226001", "226010", "226020", "226025"] },
  { city: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, pincodes: ["380001", "380015", "380054", "380061"] },
  { city: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, pincodes: ["700001", "700020", "700053", "700091"] },
  { city: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.391, pincodes: ["201301", "201304", "201306", "201310"] },
  { city: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266, pincodes: ["122001", "122002", "122015", "122018"] },
  { city: "Chandigarh", state: "Chandigarh", lat: 30.7333, lng: 76.7794, pincodes: ["160001", "160017", "160019", "160036"] },
  { city: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577, pincodes: ["452001", "452010", "452014", "452020"] },
  { city: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673, pincodes: ["682001", "682016", "682024", "682030"] },
];

// ============================================================
// DATA: Products
// ============================================================
const PRODUCTS = [
  { name: "iPhone 15 Pro Max 256GB", category: "Electronics", brand: "Apple", price: 159900, weight: 0.5, dimensions: { length: 16, width: 8, height: 8 }, sku: "APL-IP15PM-256" },
  { name: "Samsung Galaxy S24 Ultra", category: "Electronics", brand: "Samsung", price: 129999, weight: 0.45, dimensions: { length: 16, width: 8, height: 8 }, sku: "SAM-GS24U-256" },
  { name: "Sony WH-1000XM5 Headphones", category: "Electronics", brand: "Sony", price: 29990, weight: 0.25, dimensions: { length: 25, width: 20, height: 10 }, sku: "SNY-WH1000XM5" },
  { name: "MacBook Air M3 15-inch", category: "Electronics", brand: "Apple", price: 149900, weight: 1.5, dimensions: { length: 35, width: 25, height: 3 }, sku: "APL-MBA-M3-15" },
  { name: "Nike Air Jordan 1 Retro High", category: "Footwear", brand: "Nike", price: 16995, weight: 1.0, dimensions: { length: 35, width: 25, height: 15 }, sku: "NKE-AJ1-RH" },
  { name: "Levi's 511 Slim Fit Jeans", category: "Clothing", brand: "Levi's", price: 3999, weight: 0.8, dimensions: { length: 40, width: 30, height: 5 }, sku: "LEV-511-SF" },
  { name: "Dyson V15 Detect Vacuum", category: "Home Appliances", brand: "Dyson", price: 62900, weight: 3.0, dimensions: { length: 120, width: 30, height: 25 }, sku: "DYS-V15-DET" },
  { name: "Kindle Paperwhite 11th Gen", category: "Electronics", brand: "Amazon", price: 16999, weight: 0.2, dimensions: { length: 17, width: 12, height: 1 }, sku: "AMZ-KPW-11" },
  { name: "boAt Airdopes 441 Earbuds", category: "Electronics", brand: "boAt", price: 1499, weight: 0.05, dimensions: { length: 8, width: 6, height: 3 }, sku: "BOT-AD441" },
  { name: "HP Pavilion Gaming Laptop", category: "Electronics", brand: "HP", price: 72990, weight: 2.3, dimensions: { length: 36, width: 26, height: 3 }, sku: "HP-PAV-GM" },
  { name: "Puma RS-X Running Shoes", category: "Footwear", brand: "Puma", price: 8999, weight: 0.8, dimensions: { length: 35, width: 22, height: 12 }, sku: "PMA-RSX-RN" },
  { name: "Prestige Iris Gas Stove", category: "Home Appliances", brand: "Prestige", price: 4299, weight: 5.0, dimensions: { length: 60, width: 35, height: 10 }, sku: "PRE-IRIS-GS" },
  { name: "JBL Charge 5 Speaker", category: "Electronics", brand: "JBL", price: 15999, weight: 0.96, dimensions: { length: 22, width: 10, height: 10 }, sku: "JBL-CHG5" },
  { name: "Allen Solly Formal Shirt", category: "Clothing", brand: "Allen Solly", price: 1799, weight: 0.3, dimensions: { length: 35, width: 25, height: 3 }, sku: "ALS-FRM-SH" },
  { name: "Xiaomi Pad 6 Tablet", category: "Electronics", brand: "Xiaomi", price: 26999, weight: 0.49, dimensions: { length: 25, width: 17, height: 1 }, sku: "XMI-PAD6" },
];

// ============================================================
// DATA: Hubs
// ============================================================
const HUBS = [
  { name: "Mumbai Central Hub", code: "HUB-MUM-01", city: "Mumbai", state: "Maharashtra", street: "Lower Parel, Mumbai", pincode: "400013", lat: 18.998, lng: 72.831, capacity: 500 },
  { name: "Delhi NCR Hub", code: "HUB-DEL-01", city: "Delhi", state: "Delhi", street: "Okhla Phase 2, Delhi", pincode: "110020", lat: 28.5304, lng: 77.2713, capacity: 750 },
  { name: "Bengaluru Whitefield Hub", code: "HUB-BLR-01", city: "Bengaluru", state: "Karnataka", street: "Whitefield, Bengaluru", pincode: "560066", lat: 12.9698, lng: 77.7499, capacity: 600 },
  { name: "Hyderabad Gachibowli Hub", code: "HUB-HYD-01", city: "Hyderabad", state: "Telangana", street: "Gachibowli, Hyderabad", pincode: "500032", lat: 17.4401, lng: 78.3489, capacity: 400 },
  { name: "Chennai OMR Hub", code: "HUB-CHN-01", city: "Chennai", state: "Tamil Nadu", street: "Sholinganallur, Chennai", pincode: "600119", lat: 12.901, lng: 80.2279, capacity: 350 },
  { name: "Pune Hinjewadi Hub", code: "HUB-PUN-01", city: "Pune", state: "Maharashtra", street: "Hinjewadi Phase 1, Pune", pincode: "411057", lat: 18.5912, lng: 73.738, capacity: 300 },
  { name: "Kolkata Salt Lake Hub", code: "HUB-KOL-01", city: "Kolkata", state: "West Bengal", street: "Salt Lake, Kolkata", pincode: "700091", lat: 22.5806, lng: 88.4178, capacity: 350 },
  { name: "Ahmedabad SG Highway Hub", code: "HUB-AMD-01", city: "Ahmedabad", state: "Gujarat", street: "SG Highway, Ahmedabad", pincode: "380054", lat: 23.0469, lng: 72.5273, capacity: 300 },
];

// ============================================================
// DATA: Names and streets for users
// ============================================================
const FIRST_NAMES = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Ananya", "Diya", "Myra", "Sara", "Aanya", "Isha", "Navya", "Riya", "Priya", "Shreya", "Rahul", "Amit", "Vikram", "Rohan", "Neha", "Pooja", "Karan", "Deepak", "Sneha", "Meera"];
const LAST_NAMES = ["Sharma", "Patel", "Kumar", "Singh", "Gupta", "Reddy", "Mehta", "Joshi", "Nair", "Iyer", "Verma", "Agarwal", "Chopra", "Malhotra", "Bhatia", "Kapoor", "Mishra", "Rao", "Das", "Pillai"];
const STREETS = ["MG Road", "Station Road", "Gandhi Nagar", "Nehru Colony", "Civil Lines", "Rajendra Nagar", "Indira Puram", "Sector 15", "Jubilee Hills", "Koramangala", "Andheri West", "Banjara Hills", "T Nagar", "Connaught Place", "Salt Lake"];

const RETURN_REASONS = [
  { category: "changed_mind" as const, reasons: ["I found a better alternative", "No longer need this product", "Bought by mistake", "Changed my mind after ordering"] },
  { category: "size_issue" as const, reasons: ["Too small for me", "Too large, need a smaller size", "Size doesn't match the chart", "Wrong fit"] },
  { category: "not_as_described" as const, reasons: ["Color is different from the listing", "Product looks different from images", "Features don't match description", "Material quality is different"] },
  { category: "damaged" as const, reasons: ["Package arrived with dents", "Product has scratches", "Screen was cracked on arrival", "Box was opened and resealed"] },
  { category: "defective" as const, reasons: ["Product doesn't turn on", "Missing parts in the box", "Stops working after 5 minutes", "Buttons not functioning"] },
  { category: "wrong_item" as const, reasons: ["Received completely wrong product", "Different color than ordered", "Different variant received", "Someone else's order delivered"] },
];

// ============================================================
// Helpers
// ============================================================
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function jitterCoords(lat: number, lng: number, radiusKm: number = 15) {
  const latOffset = (Math.random() - 0.5) * (radiusKm / 111);
  const lngOffset = (Math.random() - 0.5) * (radiusKm / (111 * Math.cos(lat * Math.PI / 180)));
  return { lat: lat + latOffset, lng: lng + lngOffset };
}

function generateOrderId(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

// ============================================================
// SEED FUNCTION
// ============================================================
export async function seed(disconnect: boolean = true) {
  console.log("🌱 Starting seed...\n");

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.mongodbUri);
    console.log("✅ Connected to MongoDB\n");
  }

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Hub.deleteMany({}),
    Order.deleteMany({}),
    Return.deleteMany({}),
    FraudLog.deleteMany({}),
  ]);
  console.log("🗑️  Cleared existing data\n");

  // --- 1. Seed Products ---
  const products = await Product.insertMany(
    PRODUCTS.map((p) => ({ ...p, imageUrl: "" }))
  );
  console.log(`📦 Created ${products.length} products`);

  // --- 2. Seed Hubs ---
  const hubs = await Hub.insertMany(
    HUBS.map((h) => ({
      name: h.name,
      code: h.code,
      address: { street: h.street, city: h.city, state: h.state, pincode: h.pincode },
      location: { type: "Point" as const, coordinates: [h.lng, h.lat] },
      capacity: h.capacity,
      currentStock: Math.floor(Math.random() * h.capacity * 0.3),
      isActive: true,
    }))
  );
  console.log(`🏢 Created ${hubs.length} hubs`);

  // --- 3. Seed Users (40 users across different cities) ---
  const usersData = [];
  for (let i = 0; i < 40; i++) {
    const city = pick(CITIES);
    const coords = jitterCoords(city.lat, city.lng);
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const isFrequentReturner = i < 3; // First 3 users are suspicious

    usersData.push({
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      phone: `+91${Math.floor(7000000000 + Math.random() * 3000000000)}`,
      address: {
        street: `${Math.floor(Math.random() * 500) + 1}, ${pick(STREETS)}`,
        city: city.city,
        state: city.state,
        pincode: pick(city.pincodes),
        coordinates: coords,
      },
      accountCreatedAt: isFrequentReturner ? daysAgo(15) : daysAgo(Math.floor(randomBetween(30, 700))),
      totalOrders: isFrequentReturner ? Math.floor(randomBetween(3, 8)) : Math.floor(randomBetween(5, 50)),
      totalReturns: isFrequentReturner ? Math.floor(randomBetween(4, 8)) : Math.floor(randomBetween(0, 3)),
      fraudScore: 0,
      role: i === 0 ? "admin" as const : "customer" as const,
    });
  }
  const users = await User.insertMany(usersData);
  console.log(`👤 Created ${users.length} users`);

  // --- 4. Seed Orders (80 orders, some pending for demand matching) ---
  const ordersData = [];
  for (let i = 0; i < 80; i++) {
    const user = pick(users);
    const product = pick(products);
    const isPending = i < 25; // 25 pending orders for demand matching

    ordersData.push({
      orderId: generateOrderId() + i,
      userId: user._id,
      productId: product._id,
      quantity: 1,
      status: isPending
        ? (pick(["pending", "confirmed"]) as "pending" | "confirmed")
        : (pick(["shipped", "delivered"]) as "shipped" | "delivered"),
      deliveryAddress: {
        ...user.address,
      },
      expectedDelivery: isPending ? daysFromNow(Math.floor(randomBetween(1, 7))) : daysAgo(Math.floor(randomBetween(1, 30))),
      totalAmount: product.price,
    });
  }
  const orders = await Order.insertMany(ordersData);
  console.log(`🛒 Created ${orders.length} orders`);

  // --- 5. Seed Returns (25 returns in various states) ---
  const deliveredOrders = orders.filter((o) => o.status === "delivered");
  const returnsData = [];

  const statusFlows: { status: any; count: number }[] = [
    { status: "initiated", count: 5 },
    { status: "picked_up", count: 4 },
    { status: "in_transit", count: 3 },
    { status: "condition_check", count: 3 },
    { status: "routed", count: 5 },
    { status: "out_for_delivery", count: 3 },
    { status: "delivered", count: 2 },
  ];

  let returnIdx = 0;
  for (const flow of statusFlows) {
    for (let i = 0; i < flow.count; i++) {
      if (returnIdx >= deliveredOrders.length) break;
      const order = deliveredOrders[returnIdx];
      const user = users.find((u) => u._id.toString() === order.userId.toString())!;
      const product = products.find((p) => p._id.toString() === order.productId.toString())!;
      const returnReason = pick(RETURN_REASONS);
      const reason = pick(returnReason.reasons);

      // Determine condition based on reason
      let conditionScore: number;
      let conditionGrade: string;
      switch (returnReason.category) {
        case "changed_mind":
        case "wrong_item":
          conditionScore = Math.floor(randomBetween(85, 100));
          conditionGrade = conditionScore >= 90 ? "pristine" : "good";
          break;
        case "size_issue":
          conditionScore = Math.floor(randomBetween(75, 95));
          conditionGrade = conditionScore >= 90 ? "pristine" : "good";
          break;
        case "not_as_described":
          conditionScore = Math.floor(randomBetween(60, 85));
          conditionGrade = conditionScore >= 70 ? "good" : "fair";
          break;
        case "damaged":
          conditionScore = Math.floor(randomBetween(20, 50));
          conditionGrade = conditionScore >= 30 ? "damaged" : "defective";
          break;
        case "defective":
          conditionScore = Math.floor(randomBetween(5, 30));
          conditionGrade = "defective";
          break;
        default:
          conditionScore = 70;
          conditionGrade = "good";
      }

      // Fraud scoring
      const isFrequentReturner = user.totalReturns > 4;
      const isHighValue = product.price > 5000;
      const isNewAccount = (Date.now() - new Date(user.accountCreatedAt).getTime()) / (1000 * 60 * 60 * 24) < 30;
      let fraudScore = 0;
      const fraudFlags: string[] = [];
      if (isFrequentReturner) { fraudScore += 25; fraudFlags.push("high_return_frequency"); }
      if (isHighValue && isFrequentReturner) { fraudScore += 20; fraudFlags.push("high_value_pattern"); }
      if (isNewAccount) { fraudScore += 15; fraudFlags.push("new_account"); }
      const fraudRisk = fraudScore > 60 ? "high" : fraudScore > 30 ? "medium" : "low";

      // Routing
      let routingDestination: string;
      let routingScore: number;
      const distanceToWarehouse = Math.floor(randomBetween(100, 800));
      let optimizedDistance: number;

      if (fraudRisk === "high" || conditionScore < 30) {
        routingDestination = "central_warehouse";
        routingScore = Math.floor(randomBetween(10, 30));
        optimizedDistance = distanceToWarehouse;
      } else if (conditionScore >= 70 && Math.random() > 0.4) {
        routingDestination = "direct_to_customer";
        routingScore = Math.floor(randomBetween(65, 95));
        optimizedDistance = Math.floor(randomBetween(5, 25));
      } else {
        routingDestination = "nearby_hub";
        routingScore = Math.floor(randomBetween(40, 65));
        optimizedDistance = Math.floor(randomBetween(15, 60));
      }

      const distanceSaved = Math.max(0, distanceToWarehouse - optimizedDistance);
      const costSaved = routingDestination !== "central_warehouse"
        ? Math.round((40 + distanceSaved * 2.5) * (1 + (product.weight - 1) * 0.3))
        : 0;
      const co2Saved = parseFloat((distanceSaved * 0.21).toFixed(2));
      const timeSaved = parseFloat((distanceSaved / 40).toFixed(1));

      // Build timeline
      const statusOrder = ["initiated", "picked_up", "in_transit", "condition_check", "routed", "out_for_delivery", "delivered"];
      const currentIdx = statusOrder.indexOf(flow.status);
      const timeline = [];
      for (let s = 0; s <= currentIdx; s++) {
        timeline.push({
          status: statusOrder[s],
          timestamp: daysAgo(currentIdx - s),
          location: user.address.city,
          notes: `Status updated to ${statusOrder[s]}`,
        });
      }

      returnsData.push({
        returnId: `RET-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}${returnIdx}`,
        originalOrderId: order._id,
        userId: user._id,
        productId: product._id,
        reason,
        reasonCategory: returnReason.category,
        status: flow.status,
        pickupAddress: user.address,
        conditionImages: [],
        conditionGrade,
        conditionScore,
        fraudScore,
        fraudFlags,
        fraudRisk,
        routingDestination: flow.status === "initiated" ? undefined : routingDestination,
        routingScore: flow.status === "initiated" ? 0 : routingScore,
        routingReasoning: {
          conditionFactor: parseFloat((conditionScore / 100).toFixed(3)),
          demandFactor: parseFloat(randomBetween(0.2, 0.9).toFixed(3)),
          fraudFactor: parseFloat((1 - fraudScore / 100).toFixed(3)),
          proximityFactor: parseFloat(randomBetween(0.3, 0.95).toFixed(3)),
          timeSavingsFactor: parseFloat(randomBetween(0.2, 0.8).toFixed(3)),
        },
        matchedOrderId: routingDestination === "direct_to_customer" && orders.find(o => o.status === "pending") ? orders.find(o => o.status === "pending")!._id : undefined,
        assignedHubId: routingDestination === "nearby_hub" ? pick(hubs)._id : undefined,
        originalDistance: distanceToWarehouse,
        optimizedDistance,
        costSaved,
        co2Saved,
        timeSaved,
        timeline,
      });

      returnIdx++;
    }
  }

  const returns = await Return.insertMany(returnsData);
  console.log(`🔄 Created ${returns.length} returns`);

  // --- 6. Seed Fraud Logs for high/medium risk returns ---
  const flaggedReturns = returns.filter((r) => r.fraudRisk !== "low");
  const fraudLogsData = flaggedReturns.map((r) => ({
    returnId: r._id,
    userId: r.userId,
    score: r.fraudScore,
    risk: r.fraudRisk,
    flags: r.fraudFlags.map((f: string) => ({
      flag: f,
      description: getFlagDescription(f),
      weight: getFlagWeight(f),
      triggered: true,
    })),
  }));

  if (fraudLogsData.length > 0) {
    const fraudLogs = await FraudLog.insertMany(fraudLogsData);
    console.log(`🚨 Created ${fraudLogs.length} fraud logs`);
  }

  // --- Summary ---
  console.log("\n✅ Seed complete! Summary:");
  console.log(`   📦 ${products.length} products`);
  console.log(`   🏢 ${hubs.length} hubs`);
  console.log(`   👤 ${users.length} users`);
  console.log(`   🛒 ${orders.length} orders (${orders.filter(o => o.status === "pending" || o.status === "confirmed").length} pending/confirmed)`);
  console.log(`   🔄 ${returns.length} returns`);

  const directCount = returns.filter((r) => r.routingDestination === "direct_to_customer").length;
  const hubCount = returns.filter((r) => r.routingDestination === "nearby_hub").length;
  const warehouseCount = returns.filter((r) => r.routingDestination === "central_warehouse").length;
  const unrouted = returns.filter((r) => !r.routingDestination).length;

  console.log(`\n   📊 Routing breakdown:`);
  console.log(`      🚀 Direct to customer: ${directCount}`);
  console.log(`      📦 Nearby hub: ${hubCount}`);
  console.log(`      🏭 Central warehouse: ${warehouseCount}`);
  console.log(`      ⏳ Unrouted: ${unrouted}`);

  const totalCostSaved = returns.reduce((sum, r) => sum + r.costSaved, 0);
  const totalCo2Saved = returns.reduce((sum, r) => sum + r.co2Saved, 0);
  console.log(`\n   💰 Total cost saved: ₹${totalCostSaved.toLocaleString()}`);
  console.log(`   🌱 Total CO₂ saved: ${totalCo2Saved.toFixed(2)} kg`);

  if (disconnect) {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

function getFlagDescription(flag: string): string {
  const descriptions: Record<string, string> = {
    high_return_frequency: "User has excessive returns in last 30 days",
    high_value_pattern: "Pattern of returning high-value items",
    new_account: "Account was created recently",
    reason_inconsistency: "Return reason doesn't match product condition",
    rapid_return: "Product returned within 24 hours of delivery",
    address_cluster: "Multiple returns from the same address cluster",
  };
  return descriptions[flag] || flag;
}

function getFlagWeight(flag: string): number {
  const weights: Record<string, number> = {
    high_return_frequency: 25,
    high_value_pattern: 20,
    new_account: 15,
    reason_inconsistency: 15,
    rapid_return: 10,
    address_cluster: 15,
  };
  return weights[flag] || 10;
}

const isDirectRun = process.argv[1]?.replace(/\\/g, "/").includes("seedData");
if (isDirectRun) {
  seed(true).catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
}

