const { connectDB } = require("./db");
const fetch = require("node-fetch");
const crypto = require("crypto");

const POLL_INTERVAL = parseInt(process.env.WORKER_POLL_INTERVAL_MS || "1000", 10);
const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || "3600", 10);
const HF_KEY = process.env.HF_API_KEY;

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
function cacheKey(m,p,a){ return crypto.createHash("sha256").update(m+"::"+p+"::"+JSON.stringify(a||{})).digest("hex"); }

async function callHf(model, prompt, parameters, retries=3) {
  if (!HF_KEY) throw new Error("HF_API_KEY not configured");
  const url = `https://api-inference.huggingface.co/models/${model}`;
  const body = { inputs: prompt, parameters: parameters||{} };

  for (let i=1;i<=retries;i++){
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization:`Bearer ${HF_KEY}`, "Content-Type":"application/json" },
        body: JSON.stringify(body)
      });
      const text = await res.text();
      let parsed;
      try { parsed = JSON.parse(text); } catch(e) { parsed = text; }
      if (!res.ok) throw new Error(`HF ${res.status}: ${text}`);
      return parsed;
    } catch(err) {
      if (i===retries) throw err;
      await sleep(500 * i);
    }
  }
}

async function callHfImage(model, prompt, parameters, retries=3) {
  if (!HF_KEY) throw new Error("HF_API_KEY not configured");
  const url = `https://api-inference.huggingface.co/models/${model}`;
  const body = { inputs: prompt, parameters: parameters||{} };

  for (let i=1;i<=retries;i++){
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization:`Bearer ${HF_KEY}`, "Content-Type":"application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HF ${res.status}: ${txt}`);
      }
      const arrayBuffer = await res.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      return `data:image/png;base64,${base64}`;
    } catch(err) {
      if (i===retries) throw err;
      await sleep(500 * i);
    }
  }
}

async function processOne(db){
  const job = await db.collection("jobs").findOneAndUpdate(
    { status:"pending" },
    { $set:{ status:"processing", processingAt:new Date() } },
    { sort:{ createdAt:1 }, returnDocument:"after" }
  );
  // findOneAndUpdate with returnDocument:'after' returns the document in a 'value' property
  // If no document was found, 'value' will be null.
  if (!job || !job.value) return; 
  const doc = job.value;

  try {
    const key = cacheKey(doc.model, doc.prompt, doc.parameters);
    const cache = await db.collection("cache").findOne({ key });
    if (cache){
      await db.collection("jobs").updateOne({ _id: doc._id }, { $set:{ status:"done", result: cache.value, cached:true, updatedAt:new Date() } });
      return;
    }

    if (doc.type && doc.type === "image") {
      const imageDataUri = await callHfImage(doc.model, doc.prompt, doc.parameters);
      await db.collection("chats").insertOne({ prompt: doc.prompt, response: { image: imageDataUri }, model: doc.model, createdAt: new Date(), type: "image" });
      await db.collection("jobs").updateOne({ _id: doc._id }, { $set: { status: "done", result: { image: imageDataUri }, updatedAt: new Date() } });
      await db.collection("cache").updateOne({ key }, { $set: { key, value: { image: imageDataUri }, expiresAt: new Date(Date.now() + CACHE_TTL*1000) } }, { upsert:true });
      return;
    }

    const result = await callHf(doc.model, doc.prompt, doc.parameters);
    await db.collection("chats").insertOne({ prompt: doc.prompt, response: result, model: doc.model, createdAt: new Date(), type: "text" });
    await db.collection("jobs").updateOne({ _id: doc._id }, { $set: { status: "done", result, updatedAt: new Date() } });
    await db.collection("cache").updateOne({ key }, { $set: { key, value: result, expiresAt: new Date(Date.now() + CACHE_TTL*1000) } }, { upsert:true });
  } catch(err) {
    console.error("Worker process error:", err.message || err);
    await db.collection("jobs").updateOne({ _id: doc._id }, { $set: { status: "failed", error: String(err.message || err) } });
  }
}

async function start(){
  const db = await connectDB();
  console.log("🔁 Worker started");
  while (true) {
    try { await processOne(db); } catch(e){ console.error("Worker loop:", e.message || e); }
    await new Promise(r => setTimeout(r, POLL_INTERVAL));
  }
}
module.exports = { start };
