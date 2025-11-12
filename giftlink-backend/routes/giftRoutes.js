const express = require("express");
const router = express.Router();
const connectToDatabase = require("../models/db");
const logger = require("../logger");

// Get all gifts
router.get("/", async (req, res) => {
  logger.info("📦 Fetching all gifts");
  try {
    const db = await connectToDatabase();
    const collection = db.collection("gifts");

    const gifts = await collection.find({}).toArray();
    return res.status(200).json(gifts);
  } catch (e) {
    logger.error("❌ Error fetching gifts:", e);
    res.status(500).send("Internal Server Error");
  }
});

// Get a gift by custom id
router.get("/:id", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("gifts");

    const id = req.params.id;
    const gift = await collection.findOne({ id: id });

    if (!gift) {
      logger.error("🔍 Gift not found");
      return res.status(404).send("Gift not found");
    }

    return res.status(200).json(gift);
  } catch (e) {
    logger.error("❌ Error fetching gift:", e);
    return res.status(500).send("Internal Server Error");
  }
});

// Add a new gift
router.post("/", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("gifts");

    // Insert the new gift
    const gift = await collection.insertOne(req.body);

    logger.info("✅ Gift added successfully");
    return res.status(201).json(gift.ops[0]);
  } catch (e) {
    logger.error("❌ Error adding gift", e);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
