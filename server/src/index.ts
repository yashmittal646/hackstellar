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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/returns", returnRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/routing", routingRoutes);
app.use("/api/agents", agentRoutes);

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

