const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.MONGO_URI;
let client, db;

async function connectDB() {
  if (db) return db;
  if (!uri) throw new Error("MONGO_URI not set");

  client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  });

  await client.connect();
  db = client.db(process.env.MONGO_DB || "atharai");

  try {
    await db.collection("chats").createIndex({ createdAt: -1 });
    await db.collection("jobs").createIndex({ status: 1, createdAt: 1 });
    await db.collection("cache").createIndex({ key: 1 }, { unique: true });
    await db.collection("cache").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  } catch (e) {
    console.warn("Index create:", e.message || e);
  }

  console.log("✅ Connected to MongoDB:", db.databaseName);
  return db;
}
module.exports = { connectDB, getClient: () => client };