const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

let client;
let clientPromise;

if (!uri) {
  throw new Error("MONGODB_URI not set");
}

async function getClient() {
  if (client) return client;

  if (!clientPromise) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }

  await clientPromise;
  console.log("MongoDB Connected ✅");
  return client;
}

async function getDB() {
  const client = await getClient();
  return client.db("basex");
}

module.exports = { getDB };
