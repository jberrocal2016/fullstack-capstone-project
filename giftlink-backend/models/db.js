// db.js
require("dotenv").config();
const { MongoClient } = require("mongodb");

// Database configuration
const url = process.env.MONGO_URL;
const dbName = process.env.MONGO_DB_NAME || "giftdb";

let client = null;
let dbInstance = null;
let connectionPromise = null;

/**
 * Connect to MongoDB and return the database instance.
 * Ensures only one connection is created (singleton).
 */
async function connectToDatabase() {
  if (dbInstance) return dbInstance;

  if (!connectionPromise) {
    connectionPromise = (async () => {
      try {
        client = new MongoClient(url, { useUnifiedTopology: true });
        await client.connect();
        dbInstance = client.db(dbName);
        console.log(`✅ Connected to MongoDB: ${dbName}`);
        return dbInstance;
      } catch (err) {
        console.error("❌ Failed to connect to MongoDB:", err.message);
        throw new Error(`Database connection failed: ${err.message}`);
      }
    })();
  }

  return connectionPromise;
}

/**
 * Close the MongoDB connection gracefully.
 */
async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    dbInstance = null;
    connectionPromise = null;
    console.log("🔒 MongoDB connection closed");
  }
}

module.exports = { connectToDatabase, closeDatabase };
