// db.js
require("dotenv").config();
const { MongoClient } = require("mongodb");

// Database configuration
let url = `${process.env.MONGO_URL}`;
const dbName = "giftdb";

let dbInstance = null;

async function connectToDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  const client = new MongoClient(url);

  try {
    // Connect to MongoDB
    await client.connect();

    // Select database
    dbInstance = client.db(dbName);

    // Return database instance
    return dbInstance;
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    throw new Error("Database connection failed");
  }
}

module.exports = connectToDatabase;
