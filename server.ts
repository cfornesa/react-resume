import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import { initRAG, getContext } from "./src/server/rag_module.ts";
import { generateResponse } from "./src/server/model.ts";

// Loads .env from project root if present (local dev convenience).
// In production, env vars are set via the Hostinger panel and available as process.env.* directly.
dotenv.config();

// Fail fast at startup if required vars are missing — surfaces errors before any request is served.
const REQUIRED_VARS = ["MISTRAL_API_KEY", "AGENT_ID"] as const;
const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error(`[FATAL] Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const isProduction = process.env.NODE_ENV !== "development";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Initialize RAG on startup
  await initRAG();

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      const context = await getContext(message);
      const result = await generateResponse(message, history, context);
      
      res.json(result);
    } catch (error: any) {
      console.error("Chat Error:", error);
      res.status(500).json({ reply: `System Error: ${error.message}` });
    }
  });

  // Vite middleware for development
  if (!isProduction) {
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();