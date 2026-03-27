import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { initRAG, getContext } from "./src/server/rag_module.ts";
import { generateResponse } from "./src/server/model.ts";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOTENV_PATHS = [
  path.join(__dirname, "config.env"),
  path.join(__dirname, "..", "config.env"),
  path.join(process.cwd(), "config.env"),
];
for (const p of DOTENV_PATHS) {
  if (existsSync(p)) dotenv.config({ path: p });
}
dotenv.config();

const isProduction = process.env.NODE_ENV === "production" || !process.env.NODE_ENV;

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