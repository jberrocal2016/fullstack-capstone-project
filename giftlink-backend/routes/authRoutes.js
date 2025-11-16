/*jshint esversion: 8 */
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
    body("firstName")
      .optional()
      .notEmpty()
      .withMessage("First name cannot be empty"),
  ],
  asyncWrapper(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error("⚠️ Validation errors in update request", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const email = req.headers.email;
    if (!email) {
      logger.error("⚠️ Email not found in request headers");
      return res
        .status(400)
        .json({ error: "Email not found in request headers" });
    }

    const db = await connectToDatabase();
    const collection = db.collection("users");

    // Identify user by JWT payload instead of headers
    const existingUser = await collection.findOne({ email });
    if (!existingUser) {
      logger.error("🔍 User not found");
      return res.status(404).json({ error: "User not found" });
    }

    // Only update specific fields, not overwrite entire user object
    const updateFields = {};
    if (req.body.firstName) updateFields.firstName = req.body.firstName;
    updateFields.updatedAt = new Date();

    const updatedUser = await collection.findOneAndUpdate(
      { email },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    // Defensive check: ensure update succeeded
    if (!updatedUser.value) {
      // Check if the user still exists
      const stillExists = await collection.findOne({ email });
      if (stillExists) {
        logger.info("✅ User update applied, but no new document returned");
        return res.status(200).json({
          message: "Update applied",
          authtoken: req.headers.authorization.split(" ")[1],
        });
      }
      logger.error("❌ User not found for email:", email);
      return res.status(404).json({ error: "User not found" });
    }

    const payload = { user: { id: updatedUser._id.toString() } };
    const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    logger.info("✅ User updated successfully");
    res.json({ authtoken });
  })
);

module.exports = router;
