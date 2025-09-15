const { connectDB } = require("./db");
const crypto = require("crypto");

// Use native fetch in Node.js 18+ or fallback to node-fetch
const fetch = globalThis.fetch || require("node-fetch");

const POLL_INTERVAL = parseInt(process.env.WORKER_POLL_INTERVAL_MS || "2000", 10); // Reduced DB load
const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || "7200", 10);
const HF_KEY = process.env.HF_API_KEY;

// Best 2025 AI Models Configuration
const MODELS = {
  text: {
    default: "microsoft/DialoGPT-medium",
    fast: "mistralai/Mistral-7B-Instruct-v0.3", 
    quality: "meta-llama/Llama-3.3-70B-Instruct",
    reasoning: "deepseek-ai/deepseek-r1-distill-qwen-1.5b"
  },
  image: {
    default: "black-forest-labs/FLUX.1-schnell",
    fast: "black-forest-labs/FLUX.1-schnell", 
    quality: "black-forest-labs/FLUX.1-dev",
    stable: "stabilityai/stable-diffusion-3.5-large"
  }
};

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
function cacheKey(m,p,a){ return crypto.createHash("sha256").update(m+"::"+p+"::"+JSON.stringify(a||{})).digest("hex"); }

function formatChatPrompt(model, prompt) {
  // Apply proper chat templating for instruct models
  if (model.includes("Instruct") || model.includes("instruct")) {
    if (model.includes("mistral") || model.includes("Mistral")) {
      return `<s>[INST] ${prompt} [/INST]`;
    } else if (model.includes("llama") || model.includes("Llama")) {
      return `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;
    }
  }
  return prompt; // For base models like DialoGPT
}

async function callHf(model, prompt, parameters, retries=3) {
  if (!HF_KEY) throw new Error("HF_API_KEY not configured");
  const url = `https://api-inference.huggingface.co/models/${model}`;
  
  // Format prompt properly for instruct models
  const formattedPrompt = formatChatPrompt(model, prompt);
  
  // Enhanced parameters for better text generation
  const enhancedParams = {
    max_new_tokens: parameters.max_new_tokens || 512,
    temperature: parameters.temperature || 0.7,
    top_p: parameters.top_p || 0.9,
    repetition_penalty: parameters.repetition_penalty || 1.1,
    do_sample: true,
    return_full_text: false,
    ...parameters
  };
  
  const body = { inputs: formattedPrompt, parameters: enhancedParams };

  for (let i=1;i<=retries;i++){
    try {
      // Add timeout and abort controller for production reliability
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const res = await fetch(url, {
        method: "POST",
        headers: { 
          Authorization:`Bearer ${HF_KEY}`, 
          "Content-Type":"application/json",
          "x-wait-for-model": "true"
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const text = await res.text();
      let parsed;
      try { parsed = JSON.parse(text); } catch(e) { parsed = text; }
      
      if (!res.ok) {
        if (res.status === 503 && text.includes("loading")) {
          console.log(`Model ${model} is loading, waiting...`);
          await sleep(3000 * i);
          continue;
        } else if (res.status === 429) {
          console.log(`Rate limited, waiting before retry...`);
          await sleep(5000 * i); // Exponential backoff for rate limits
          continue;
        } else if (res.status >= 500) {
          console.log(`Server error ${res.status}, retrying...`);
          await sleep(2000 * i);
          continue;
        }
        throw new Error(`HF ${res.status}: ${text}`);
      }
      
      // Extract generated text from response
      if (Array.isArray(parsed) && parsed[0]?.generated_text) {
        return parsed[0].generated_text;
      } else if (typeof parsed === 'string') {
        return parsed;
      } else if (parsed.generated_text) {
        return parsed.generated_text;
      }
      
      return parsed;
    } catch(err) {
      console.error(`Text generation attempt ${i}/${retries} failed:`, err.message);
      if (err.name === 'AbortError') {
        console.error(`Request timeout for model ${model}`);
      }
      if (i===retries) throw err;
      await sleep(Math.min(1000 * Math.pow(2, i), 10000)); // Exponential backoff capped at 10s
    }
  }
}

async function callHfImage(model, prompt, parameters, retries=3) {
  if (!HF_KEY) throw new Error("HF_API_KEY not configured");
  const url = `https://api-inference.huggingface.co/models/${model}`;
  
  // Optimized parameters for FLUX.1-schnell and modern image models
  const enhancedParams = {
    width: parameters.width || 1024,
    height: parameters.height || 1024,
    guidance_scale: parameters.guidance_scale || (model.includes('FLUX.1-schnell') ? 0.0 : 7.5),
    num_inference_steps: parameters.num_inference_steps || (model.includes('FLUX.1-schnell') ? 4 : 20),
    scheduler: parameters.scheduler || "DPMSolverMultistepScheduler",
    seed: parameters.seed || Math.floor(Math.random() * 1000000),
    ...parameters
  };
  
  const body = { inputs: prompt, parameters: enhancedParams };

  for (let i=1;i<=retries;i++){
    try {
      console.log(`🎨 Generating image with ${model} (attempt ${i}/${retries})`);
      
      // Add timeout for image generation too
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for images
      
      const res = await fetch(url, {
        method: "POST",
        headers: { 
          Authorization:`Bearer ${HF_KEY}`, 
          "Content-Type":"application/json",
          "x-wait-for-model": "true",
          "Accept": "image/png"
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const txt = await res.text();
        if (res.status === 503 && txt.includes("loading")) {
          console.log(`Model ${model} is loading, waiting...`);
          await sleep(5000 * i);
          continue;
        } else if (res.status === 429) {
          console.log(`Rate limited on image generation, waiting...`);
          await sleep(10000 * i); // Longer wait for image rate limits
          continue;
        } else if (res.status >= 500) {
          console.log(`Server error ${res.status} for image generation, retrying...`);
          await sleep(3000 * i);
          continue;
        }
        throw new Error(`HF ${res.status}: ${txt}`);
      }
      
      const arrayBuffer = await res.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        throw new Error("Empty image response");
      }
      
      // For production: should store in object storage (S3/R2) and return URL
      // For now: return base64 but add size limits to prevent DB bloat
      if (arrayBuffer.byteLength > 5 * 1024 * 1024) { // 5MB limit
        throw new Error("Generated image too large (>5MB)");
      }
      
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      console.log(`✅ Image generated successfully with ${model} (${Math.round(arrayBuffer.byteLength/1024)}KB)`);
      return `data:image/png;base64,${base64}`;
    } catch(err) {
      console.error(`Image generation attempt ${i}/${retries} failed:`, err.message);
      if (err.name === 'AbortError') {
        console.error(`Image generation timeout for model ${model}`);
      }
      if (i===retries) throw err;
      await sleep(Math.min(2000 * Math.pow(2, i), 15000)); // Exponential backoff for images
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
