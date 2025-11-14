// Core packages
const express = require("express");
const { body, validationResult } = require("express-validator");

// Utilities
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Local modules
const { connectToDatabase } = require("../models/db");
const asyncWrapper = require("../util/asyncWrapper");
const logger = require("../logger");

// Config
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const router = express.Router();

// Register
router.post("/register", asyncWrapper(async (req, res) => {  
  const db = await connectToDatabase();
  const collection = db.collection("users");

  // Check for existing email
  const existingEmail = await collection.findOne({ email: req.body.email });
  if (existingEmail) {
    logger.error("🔄 Email id already exists");
    return res.status(409).json({ error: "Email id already exists" });
  }

  // Hash password
  const salt = await bcryptjs.genSalt(10);
  const hash = await bcryptjs.hash(req.body.password, salt);

  // Save user
  const newUser = await collection.insertOne({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: hash,
    createdAt: new Date(),
  });

  // Create JWT
  const payload = { user: { id: newUser.insertedId } };
  const authtoken = jwt.sign(payload, JWT_SECRET);

  logger.info("✅ User registered successfully");
  res.status(201).json({ authtoken, email: req.body.email });
  
}));

// Login
router.post("/login", asyncWrapper(async (req, res) => {
  
  const db = await connectToDatabase();
  const collection = db.collection("users");

  const theUser = await collection.findOne({ email: req.body.email });
  if (!theUser) {
    logger.error("🔍 User not found");
    return res.status(404).json({ error: "User not found" });
  }

  const result = await bcryptjs.compare(req.body.password, theUser.password);
  if (!result) {
    logger.error("🚫 Passwords do not match");
    return res.status(401).json({ error: "Wrong password" });
  }

  const payload = { user: { id: theUser._id.toString() } };
  const authtoken = jwt.sign(payload, JWT_SECRET);

  logger.info("✅ User logged in successfully");
  res.status(200).json({
    authtoken,
    userName: theUser.firstName,
    userEmail: theUser.email,
  });
  
}));

// Update User
router.put("/update", asyncWrapper(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error("⚠️ Validation errors in update request", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  
  const email = req.headers.email;
  if (!email) {
    logger.error("⚠️ Email not found in the request headers");
    return res
      .status(400)
      .json({ error: "Email not found in the request headers" });
  }

  const db = await connectToDatabase();
  const collection = db.collection("users");

  const existingUser = await collection.findOne({ email });
  if (!existingUser) {
    logger.error("🔍 User not found");
    return res.status(404).json({ error: "User not found" });
  }
  existingUser.firstName = req.body.name;
  existingUser.updatedAt = new Date();

  const updatedUser = await collection.findOneAndUpdate(
    { email },
    { $set: existingUser },
    { returnDocument: "after" }
  );

  const payload = {
    user: {
      id: updatedUser._id.toString(),
    },
  };
  const authtoken = jwt.sign(payload, JWT_SECRET);

  logger.info("✅ User updated successfully");
  res.json({ authtoken });
}));

module.exports = router;
