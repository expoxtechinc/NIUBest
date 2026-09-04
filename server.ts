import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Administrator allowed email configured via environment or defaulting to designated address
const AUTHORIZED_ADMIN_EMAILS = [
  (process.env.ADMIN_EMAIL || "aki.sokpah.link@gmail.com").toLowerCase().trim(),
  "makealuckspam@gmail.com".toLowerCase().trim()
];

// Lazy initialization for Gemini AI
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    institution: "Nova International University (NIU)",
    scope: "Certificate programmes only",
    serverTime: new Date().toISOString()
  });
});

// Admin verification check
app.post("/api/admin/verify", (req, res) => {
  const { email, uid } = req.body;
  if (!email || !uid) {
    return res.status(400).json({ error: "Missing email or uid" });
  }

  const normalized = String(email).toLowerCase().trim();
  const isAdmin = AUTHORIZED_ADMIN_EMAILS.includes(normalized);

  return res.json({
    isAdmin,
    role: isAdmin ? "admin" : "student",
    institution: "Nova International University"
  });
});

// AI Academic Assistant - Draft -> Human Review -> Approval
app.post("/api/ai/academic-assistant", async (req, res) => {
  try {
    const { taskType, context, title, category } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "AI Academic Assistant is unavailable: GEMINI_API_KEY is not configured.",
        isConfigured: false
      });
    }

    const ai = getGemini();

    let prompt = `You are the Academic Curriculum Assistant for Nova International University (NIU), an academic institution focused strictly on structured certificate education. 
Tone: Serious, rigorous, academic, concise, clear, and structured.
Important constraint: NIU offers certificate programmes only. Never claim external degrees, accreditation, or government ranking.

TASK: `;

    if (taskType === "programme_description") {
      prompt += `Draft a comprehensive academic description, 4 key programme objectives, and 4 measurable learning outcomes for a certificate programme titled "${title}" in the domain of "${category}". Provide output as clean structured text suitable for human academic review.`;
    } else if (taskType === "course_outline") {
      prompt += `Propose an academic course outline with 3-4 structured modules for the course "${title}" with detailed learning outcomes, estimated study minutes, and recommended learner support guidance.`;
    } else if (taskType === "lesson_content") {
      prompt += `Draft structured academic lesson content for "${title}". Include: 
1. Introduction
2. Learning Objectives (3 bullet points)
3. Key Academic Concepts
4. Real-world Practical Application
5. Mini Case Study
6. Self-Check Concept Questions
7. Key Takeaways and Summary.`;
    } else if (taskType === "quiz_questions") {
      prompt += `Generate 4 rigorous multiple-choice assessment questions for "${title}". For each question provide:
- Question stem
- 4 options (A, B, C, D)
- Identified correct answer
- Detailed academic explanation justifying the correct answer
- Difficulty level (Beginner/Intermediate/Advanced)`;
    } else {
      prompt += `Assist with drafting academic notes and instructional guidelines for "${title || 'Academic Programme'}": ${context || ''}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const outputText = response.text || "No output generated.";
    return res.json({
      success: true,
      draft: outputText,
      disclaimer: "All AI drafts must undergo human review and official academic approval before publishing."
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate academic content draft."
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nova International University platform server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
