// Import necessary modules and initialize environment variables
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
  console.warn(`[WARN] Missing environment variables: ${missing.join(", ")}. API routes will fail until these are set.`);
}

// Determine if we're in production mode based on NODE_ENV. 
// This controls whether we use Vite's dev middleware or serve static files.
const isProduction = process.env.NODE_ENV !== "development";

// Main function to start the Express server
async function startServer() {
  // Create Express app and define the port
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware to parse JSON bodies in requests
  app.use(express.json());

  // Initialize RAG on startup
  await initRAG();

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Main chat endpoint that processes 
    // incoming messages, 
    // retrieves context, 
    // and generates responses
  app.post("/api/chat", async (req, res) => {
    try {
      // Extract message and history from the request body
      const { message, history } = req.body;
      
      // Get relevant context based on the incoming message
      const context = await getContext(message);
      const result = await generateResponse(message, history, context);
      
      // Send the generated response back to the client
      res.json(result);
    } catch (error: any) {
      // Log the error and return a 500 response with the error message
      console.error("Chat Error:", error);
      res.status(500).json({ reply: `System Error: ${error.message}` });
    }
  });

  // Vite middleware for development
  if (!isProduction) {
    // Create Vite server in middleware mode for development
    const vite = await createViteServer({
      // Vite server configuration for development mode
      server: { middlewareMode: true },
      // Specify the app type as "spa" for single-page applications
      appType: "spa",
    });
    // Use Vite's middleware to serve the app during development
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from the "dist" directory
    const distPath = path.join(process.cwd(), "dist");
    // Serve static files and handle client-side routing by sending index.html for all routes
    app.use(express.static(distPath));
    // For any route not handled by static files, 
      // send index.html to allow client-side routing to work
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start the server and listen on the specified port
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();