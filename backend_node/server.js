require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const cors = require("cors");

const { connectDB } = require("./db");
const inferenceRouter = require("./routes/inference");
const worker = require("./worker");

const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit:"200kb" }));
app.use(rateLimit({ windowMs: 60*1000, max: 30 }));

app.get("/health", (req,res) => res.json({ ok:true, time: new Date() }));
app.use("/inference", inferenceRouter);

app.get("/stats", async (req,res)=>{
  try {
    const db = await connectDB();
    const chats = await db.collection("chats").countDocuments();
    const jobsPending = await db.collection("jobs").countDocuments({ status: "pending" });
    res.json({ ok:true, chats, jobsPending });
  } catch(e){ res.status(500).json({ error: "internal error" }); }
});

const PORT = process.env.PORT || 8080;
(async ()=>{
  try {
    await connectDB();
    app.listen(PORT, ()=>console.log(`🚀 Backend listening on ${PORT}`));
    worker.start().catch(err => console.error("Worker failed:", err));
  } catch(e){
    console.error("Startup failed:", e);
    process.exit(1);
  }
})();