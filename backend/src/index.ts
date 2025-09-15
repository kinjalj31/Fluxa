import dotenv from "dotenv";
import path from "path";

// Explicitly load .env file
dotenv.config({ path: path.join(__dirname, '../.env') });
console.log('Environment loaded:', {
  AWS_REGION: process.env.AWS_REGION,
  TEXTRACT_SNS_TOPIC_ARN: process.env.TEXTRACT_SNS_TOPIC_ARN ? 'SET' : 'NOT SET',
  TEXTRACT_ROLE_ARN: process.env.TEXTRACT_ROLE_ARN ? 'SET' : 'NOT SET'
});
import express from "express";
import cors from "cors";
import { DatabaseService } from "./database/database-service";
const invoiceAPI = require('./api/invoices/invoices');
const userAPI = require('./api/users/users');
import { errorHandler } from "./middleware/errorHandler";
import { SQSBroker } from "./infrastructure/messaging/sqs-broker";
import { TextractNotificationHandler } from "./workflows/textract-notification-handler";

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
    const dbService = DatabaseService.getInstance();
    const result = await dbService.healthCheck();
    console.log("Database health check successful:", result);
    console.log("============================\n");
    res.json({ db: "ok", result });
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
app.use("/api/invoices", invoiceAPI);
app.use("/api/users", userAPI);

// Error handling
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database
    const dbService = DatabaseService.getInstance();
    await dbService.initialize();
    
    // Start SQS polling for Textract notifications
    if (process.env.TEXTRACT_SQS_QUEUE_URL) {
      const sqsBroker = new SQSBroker();
      sqsBroker.setMessageHandler(TextractNotificationHandler.handleNotification);
      sqsBroker.startPolling();
      console.log("📨 SQS polling started for Textract notifications");
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log("\n" + "=".repeat(50));
      console.log("🚀 FLUXA SERVER STARTED SUCCESSFULLY!");
      console.log(`📡 Server running on port: ${PORT}`);
      console.log("💾 Database initialized and ready");
      console.log("=".repeat(50) + "\n");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
