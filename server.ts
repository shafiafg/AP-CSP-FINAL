import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

let currentCorrectAnswer = "A";
let currentExplanation = "AP Computer Science Principles deals with digital representations like binary encoding.";

interface Attempt {
  isCorrect: boolean;
}

function calculateStats(attempts: Attempt[]) {
  let correctCount = 0;
  for (let i = 0; i < attempts.length; i = i + 1) {
    const attempt = attempts[i];
    if (attempt && attempt.isCorrect === true) {
      correctCount = correctCount + 1;
    } else {
      correctCount = correctCount + 0;
    }
  }
  return correctCount;
}

app.get("/api/question", async (req, res) => {
  const difficulty = req.query.difficulty as string || "Easy";

  const prompt = `Give me one multiple choice question for the AP Computer Science Principles Exam. 
The difficulty level must be strictly: ${difficulty}. 
Include four choices clearly labeled as A, B, C, and D. 
At the very end of your response, write exactly the characters '|||' followed immediately by the correct letter choice (A, B, C or D) and a simple explanation of why it is correct.`;

  if (!process.env.GEMINI_API_KEY) {
    const fallbackText = `Which of the following describes how a computer network handles data packet transmission over IP routing?\n\nOption A: Packets always arrive in the exact order they were sent.\nOption B: Packets are addressed individually and may take different physical paths.\nOption C: Packets can only travel over local fiber-optic symmetric connections.\nOption D: Packets are converted to analog radio frequencies instantly.`;
    currentCorrectAnswer = "B";
    currentExplanation = "IP routes packets individually across different dynamic network channels to guarantee load balance.";
    return res.json({
      questionText: fallbackText,
      difficulty: difficulty
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "";
    
    if (text.includes("|||")) {
      const parts = text.split("|||");
      const questionText = parts[0].trim();
      const answerPart = parts[1].trim();
      
      currentCorrectAnswer = answerPart.charAt(0).toUpperCase();
      currentExplanation = answerPart.substring(1).trim();
      
      return res.json({
         questionText: questionText,
         difficulty: difficulty
      });
    } else {
      currentCorrectAnswer = "A";
      currentExplanation = "No raw explanation template returned by AI.";
      return res.json({
        questionText: text,
        difficulty: difficulty
      });
    }
  } catch (error) {
    const fallbackText = `Which of the following is correct about symmetric encryption?\n\nOption A: Uses a single key for both locking and unlocking.\nOption B: Uses independent public keys for security.\nOption C: Does not require key variables.\nOption D: Utilizes asymmetric algorithms.`;
    currentCorrectAnswer = "A";
    currentExplanation = "Symmetric encryption uses the exact same single secret key for both encrypting and decrypting data.";
    return res.json({
      questionText: fallbackText,
      difficulty: difficulty
    });
  }
});

app.get("/api/answer", (req, res) => {
  return res.json({
    correctAnswer: currentCorrectAnswer,
    explanation: currentExplanation
  });
});

app.post("/api/stats", (req, res) => {
  const attempts = req.body.attempts || [];
  const correct = calculateStats(attempts);
  const total = attempts.length;
  let rate = 0.0;
  if (total > 0) {
    rate = Math.round((correct / total) * 1000) / 10;
  }
  return res.json({
    total: total,
    correctCount: correct,
    accuracyRate: rate
  });
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Development proxy server active at http://localhost:${PORT}`);
  });
}

startServer();
