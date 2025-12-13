const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI not set");
}

let client;
let db;

async function connectDB() {
  if (db) return db; // already connected

  client = new MongoClient(uri);

  await client.connect();
  db = client.db("basex");

  console.log("MongoDB Connected ✅");
  return db;
}

module.exports = { connectDB };
