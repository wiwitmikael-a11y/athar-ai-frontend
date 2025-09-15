const express = require("express");
const { connectDB } = require("../db");
const { ObjectId } = require("mongodb");
const crypto = require("crypto");
const router = express.Router();

function shortId(){ return crypto.randomBytes(6).toString("hex"); }

router.post("/", async (req,res)=>{
  const db = await connectDB();
  const { model="distilgpt2", prompt="", parameters={} } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt required" });
  if (prompt.length > 20000) return res.status(400).json({ error: "prompt too long" });

  const job = { model, prompt, parameters, status: "pending", createdAt: new Date(), type: "text", jobTag: shortId() };
  const r = await db.collection("jobs").insertOne(job);
  res.status(202).json({ ok:true, jobId: r.insertedId.toString(), jobTag: job.jobTag });
});

router.post("/image", async (req,res)=>{
  const db = await connectDB();
  const { model="runwayml/stable-diffusion-v1-5", prompt="", parameters={} } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt required" });

  const job = { model, prompt, parameters, status: "pending", createdAt: new Date(), type: "image", jobTag: shortId() };
  const r = await db.collection("jobs").insertOne(job);
  res.status(202).json({ ok:true, jobId: r.insertedId.toString(), jobTag: job.jobTag });
});

router.get("/status/:jobId", async (req,res)=>{
  const db = await connectDB();
  try {
    const job = await db.collection("jobs").findOne({ _id: new ObjectId(req.params.jobId) });
    if (!job) return res.status(404).json({ error: "not found" });
    res.json({ ok: true, job });
  } catch(e){ res.status(500).json({ error: "internal error" }); }
});

router.get("/stream/:jobId", async (req,res)=>{
  const db = await connectDB();
  const jobId = req.params.jobId;
  res.setHeader("Content-Type","text/event-stream");
  res.setHeader("Cache-Control","no-cache");
  res.setHeader("Connection","keep-alive");
  res.flushHeaders && res.flushHeaders();

  let closed=false;
  req.on("close",()=>{ closed=true; });

  const pollInterval = 1000;
  (async function poll(){
    let lastStatus=null;
    while(!closed){
      try {
        const job = await db.collection("jobs").findOne({ _id: new ObjectId(jobId) });
        if (!job) { res.write(`event: error\ndata: ${JSON.stringify({ error: "job_not_found" })}\n\n`); break; }
        if (job.status !== lastStatus) {
          lastStatus = job.status;
          res.write(`event: update\ndata: ${JSON.stringify({ status: job.status, updatedAt: job.updatedAt || null })}\n\n`);
        }
        if (job.status === "done") {
          res.write(`event: result\ndata: ${JSON.stringify({ result: job.result })}\n\n`);
          break;
        }
        if (job.status === "failed") {
          res.write(`event: error\ndata: ${JSON.stringify({ error: job.error })}\n\n`);
          break;
        }
      } catch (e) {
        res.write(`event: error\ndata: ${JSON.stringify({ error: "internal" })}\n\n`);
        break;
      }
      await new Promise(r => setTimeout(r, pollInterval));
    }
    res.write(`event: end\ndata: {}\n\n`);
    res.end();
  })();
});

router.get("/history", async (req,res)=>{
  const db = await connectDB();
  try {
    const limit = Math.min(parseInt(req.query.limit||"10",10),100);
    const chats = await db.collection("chats").find({}).sort({ createdAt:-1 }).limit(limit).toArray();
    res.json({ ok:true, history: chats });
  } catch(e){ res.status(500).json({ error: "internal error" }); }
});

router.post("/clear", async (req,res)=>{
  if (String(process.env.ALLOW_CLEAR) !== "true") return res.status(403).json({ error: "disabled" });
  const db = await connectDB();
  await db.collection("chats").deleteMany({});
  await db.collection("jobs").deleteMany({});
  res.json({ ok:true, message: "cleared" });
});

module.exports = router;
