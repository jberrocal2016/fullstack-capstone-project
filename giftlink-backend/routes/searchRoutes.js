const express = require("express");
const router = express.Router();
const { connectToDatabase } = require("../models/db");
const logger = require("../logger");
const asyncWrapper = require("../util/asyncWrapper");

// Search for gifts
router.get("/", asyncWrapper(async (req, res) => {
  logger.info("🔎 Search request received", { query: req.query });
  
  const db = await connectToDatabase();
  const collection = db.collection("gifts");

  // Initialize the query object
  let query = {};

  // Name filter (case-insensitive partial match)
  if (req.query.name && req.query.name.trim() !== "") {
    query.name = { $regex: req.query.name, $options: "i" };
  }

  // Category filter
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Condition filter
  if (req.query.condition) {
    query.condition = req.query.condition;
  }

  // Age filter
  if (req.query.age_years) {
    query.age_years = { $lte: parseInt(req.query.age_years) };
  }

  const gifts = await collection.find(query).toArray();

  logger.info({ count: gifts.length }, "✅ Found gifts matching search criteria");
  res.status(200).json(gifts);
  
}));

module.exports = router;
