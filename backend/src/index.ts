import "dotenv/config";
import express from "express";
import cors from "cors";
import pool from "./db";
import invoiceRoutes from "./routes/invoiceRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check routes
app.get("/health", (_req, res) => {
  console.log("\n=== HEALTH CHECK CALLED ===");
  console.log("Time:", new Date().toISOString());
  console.log("Server is running on port:", PORT);
  console.log("========================\n");
  res.json({ ok: true, timestamp: new Date().toISOString(), port: PORT });
});

app.get("/db-check", async (_req, res) => {
  console.log("\n=== DATABASE CHECK CALLED ===");
  console.log("Time:", new Date().toISOString());
  try {
    console.log("Attempting database connection...");
    const result = await pool.query("SELECT 1 as ok, NOW() as timestamp");
    console.log("Database query successful:", result.rows[0]);
    console.log("============================\n");
    res.json({ db: "ok", result: result.rows[0] });
  } catch (err) {
    console.error("\n=== DATABASE ERROR ===");
    console.error("DB check failed:", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error("Error message:", errorMessage);
    console.error("====================\n");
    res.status(500).json({ db: "error", message: errorMessage });
  }
});

// Test route
app.post("/api/test", (req, res) => {
  console.log("Test route hit!");
  res.json({ message: "API is working!" });
});

// API routes
app.use("/api/invoices", invoiceRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log("\n" + "=".repeat(50));
  console.log("🚀 FLUXA SERVER STARTED SUCCESSFULLY!");
  console.log("=".repeat(50) + "\n");
});
