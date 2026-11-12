import express from "express";
import cors from "cors";
import path from "path";
import { config } from "./config/env";
import { connectDB } from "./config/db";
import { errorHandler } from "./middleware/errorHandler";

// Route imports
import returnRoutes from "./routes/returns";
import orderRoutes from "./routes/orders";
import dashboardRoutes from "./routes/dashboard";
import routingRoutes from "./routes/routing";
import agentRoutes from "./routes/agentRoutes";
import scanRelayRoutes from "./routes/scanRelay";
import barcodeRoutes from "./routes/barcode";
import visionRoutes from "./routes/vision";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/returns", returnRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/routing", routingRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/scan-relay", scanRelayRoutes);
app.use("/api/barcode", barcodeRoutes);
app.use("/api/vision", visionRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Hackstellar API is running 🚀" });
});

// Error handler
app.use(errorHandler);

// Start server
async function startServer() {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
    console.log(`📊 Environment: ${config.nodeEnv}`);
  });
}

startServer();

export default app;

