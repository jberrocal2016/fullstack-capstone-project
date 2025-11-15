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

// Middleware to check JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token missing" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

// Register
router.post(
  "/register",
  [
    // Validation rules for inputs
    body("email").isEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 chars"),
    body("firstName").notEmpty().withMessage("First name required"),
    body("lastName").notEmpty().withMessage("Last name required"),
  ],
  asyncWrapper(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error("⚠️ Validation errors in register request", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

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

    // Create JWT with expiration for security
    const payload = { user: { id: newUser.insertedId.toString() } };
    const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    logger.info("✅ User registered successfully");
    res.status(201).json({ authtoken, email: req.body.email });
  })
);

// Login
router.post(
  "/login",
  [
    // Validation rules for login inputs
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  asyncWrapper(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error("⚠️ Validation errors in login request", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const db = await connectToDatabase();
    const collection = db.collection("users");

    const theUser = await collection.findOne({ email: req.body.email });
    if (!theUser) {
      logger.error("🔍 User not found");
      return res.status(404).json({ error: "Invalid credentials" });
    }

    const result = await bcryptjs.compare(req.body.password, theUser.password);
    if (!result) {
      logger.error("🚫 Passwords do not match");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const payload = { user: { id: theUser._id.toString() } };
    const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    logger.info("✅ User logged in successfully");
    res.status(200).json({
      authtoken,
      userName: theUser.firstName,
      userEmail: theUser.email,
    });
  })
);

// Update User
router.put(
  "/update",
  authenticateToken, // JWT auth instead of relying on headers
  [
    // Validation rules for update inputs
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
  ],
  asyncWrapper(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error("⚠️ Validation errors in update request", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const db = await connectToDatabase();
    const collection = db.collection("users");

    // Normalize ObjectId conversion
    const { ObjectId } = require("mongodb");
    const userId = new ObjectId(req.user.user.id);

    // Identify user by JWT payload instead of headers
    const existingUser = await collection.findOne({ _id: userId });
    if (!existingUser) {
      logger.error("🔍 User not found");
      return res.status(404).json({ error: "User not found" });
    }
    // Only update specific fields, not overwrite entire user object
    const updateFields = {};
    if (req.body.name) updateFields.firstName = req.body.name;
    updateFields.updatedAt = new Date();

    const updatedUser = await collection.findOneAndUpdate(
      { _id: userId },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    // Defensive check: ensure update succeeded
    if (!updatedUser.value) {
      logger.error("Update failed, user not found after update");
      return res.status(404).json({ error: "User not found after update" });
    }

    const payload = { user: { id: updatedUser._id.toString() } };
    const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    logger.info("✅ User updated successfully");
    res.json({ authtoken });
  })
);

module.exports = router;
