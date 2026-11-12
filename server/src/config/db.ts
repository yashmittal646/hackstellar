import mongoose from "mongoose";
import { config } from "./env";
import { MongoMemoryServer } from "mongodb-memory-server";
import { seed } from "../utils/seedData";
import { Product } from "../models/Product";

let memoryServer: MongoMemoryServer | null = null;

export async function connectDB(): Promise<void> {
  let connected = false;

  // 1. If an explicit MONGODB_URI is provided or default localhost is attempted
  try {
    console.log(`📡 Connecting to MongoDB (${config.mongodbUri})...`);
    await mongoose.connect(config.mongodbUri, { serverSelectionTimeoutMS: 2500 });
    console.log("✅ MongoDB connected successfully");
    connected = true;
  } catch (error) {
    console.warn("⚠️  External/local MongoDB not reachable, starting in-memory MongoDB...");
  }

  // 2. Fall back to embedded MongoMemoryServer if external/local DB is not running
  if (!connected) {
    try {
      memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`✅ Connected to in-memory MongoDB at ${memoryUri}`);
    } catch (err) {
      console.error("❌ Failed to start in-memory MongoDB:", err);
      process.exit(1);
    }
  }

  // 3. Auto-seed if the database has no products yet
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log("🌱 Database is fresh — seeding initial demo data...");
      await seed(false);
    }
  } catch (err) {
    console.error("⚠️  Failed to check or seed database:", err);
  }
}
