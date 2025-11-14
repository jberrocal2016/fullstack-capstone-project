/*jshint esversion: 8 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pinoHttp = require("pino-http");
const logger = require("./logger");
const { connectToDatabase, closeDatabase } = require("./models/db");

// Loads sample data
const { loadData } = require("./util/import-mongo/index");

// Route imports
const giftRoutes = require("./routes/giftRoutes");
const searchRoutes = require("./routes/searchRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const port = process.env.PORT || 3060;

// Middleware
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Routes
app.use("/api/gifts", giftRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/auth", authRoutes);

// Health check / root route
app.get("/", (req, res) => {
  res.send("🚀 Server is running and ready!");
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error({ err }, "❌ Unhandled error");
  res.status(500).json({ error: "Internal Server Error" });
});

// Connect to DB and start server
connectToDatabase()
  .then(() => {
    logger.info("✅ Connected to DB");
    app.listen(port, () => {
      console.log(`🌐 Server running on port ${port}`);
    });
  })
  .catch((e) => {
    logger.error("❌ Failed to connect to DB", e);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGINT", async () => {
  await closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeDatabase();
  process.exit(0);
});
