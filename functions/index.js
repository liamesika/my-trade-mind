// functions/index.js
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

// ⚙️ סוד ל-OpenAI (להגדיר עם firebase functions:secrets:set OPENAI_API_KEY)
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// נקודת קצה: POST /api/callOpenAI
app.post("/", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid messages" });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages
    });

    const reply = completion?.choices?.[0]?.message?.content ?? "";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("❌ callOpenAI error:", err);
    return res.status(err?.status || 500).json({ error: err?.message || "Server error" });
  }
});

// פונקציית HTTP דור 2 — אזור europe-west1
export const callOpenAI = onRequest(
  { region: "europe-west1", secrets: [OPENAI_API_KEY] },
  app
);
