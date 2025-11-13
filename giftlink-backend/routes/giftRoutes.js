const express = require("express");
const router = express.Router();
const connectToDatabase = require("../models/db");
const logger = require("../logger");
const asyncWrapper = require("../util/asyncWrapper");

// Get all gifts
router.get("/", asyncWrapper(async (req, res) => {
  logger.info("📦 Fetching all gifts");
  const db = await connectToDatabase();
  const gifts = await  db.collection("gifts").find({}).toArray();
  
  logger.info({ count: gifts.length }, "✅ Gifts fetched successfully");
  res.status(200).json(gifts);  
}));

// Get a gift by custom id
router.get("/:id", asyncWrapper(async (req, res) => {
  const id = req.params.id;
  logger.info({ id }, "🔍 Fetching gift by id");

  const db = await connectToDatabase();
  const gift = await db.collection("gifts").findOne({ id });

  if (!gift) {
    logger.error({ id }, "❌ Gift not found");
    return res.status(404).json( {error: "Gift not found" });
  }

  logger.info({ id }, "✅ Gift found");
  res.status(200).json(gift);  
}));

// Add a new gift
router.post("/", asyncWrapper(async (req, res) => {
  logger.info({ body: req.body }, "📦 Adding new gift");
  
  const db = await connectToDatabase();
  // Insert the new gift
  const gift = await db.collection("gifts").insertOne(req.body);

  logger.info({ insertedId: gift.insertedId }, "✅ Gift added successfully");
  res.status(201).json(gift.ops[0]);
}));

module.exports = router;
