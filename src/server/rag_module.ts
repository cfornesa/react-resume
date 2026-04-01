import { Mistral } from "@mistralai/mistralai";
import { pipeline } from "@xenova/transformers";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

interface Document {
  content: string;
  embedding: number[];
}

interface EmbeddingsCache {
  version: string;
  documentHashes: Record<string, string>;
  documents: Document[];
}

let indexedDocs: Document[] = [];
let embeddingModel: any = null;

// Compute SHA256 hash of document contents for change detection
function hashDocumentContents(contents: string[]): Record<string, string> {
  return {
    combined: crypto.createHash("sha256").update(contents.join("|||")).digest("hex"),
  };
}

// Load embeddings from cache file if it exists and is valid
function loadEmbeddingsCache(): EmbeddingsCache | null {
  const cachePath = path.join(process.cwd(), ".embeddings.json");
  try {
    if (fs.existsSync(cachePath)) {
      const data = fs.readFileSync(cachePath, "utf-8");
      return JSON.parse(data) as EmbeddingsCache;
    }
  } catch (error) {
    console.warn("RAG: Failed to load embeddings cache, will recompute.");
  }
  return null;
}

// Save embeddings to cache file
function saveEmbeddingsCache(cache: EmbeddingsCache): void {
  const cachePath = path.join(process.cwd(), ".embeddings.json");
  try {
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), "utf-8");
    console.log("RAG: Embeddings cache saved.");
  } catch (error) {
    console.warn("RAG: Failed to save embeddings cache:", error);
  }
}

// Initialize the local embedding model (lazy load on first use)
async function ensureEmbeddingModel() {
  if (!embeddingModel) {
    console.log("RAG: Loading local embedding model...");
    embeddingModel = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return embeddingModel;
}

// Generate embedding using local model
async function embedLocally(text: string): Promise<number[]> {
  const model = await ensureEmbeddingModel();
  const result = await model(text, { pooling: "mean", normalize: true });
  return Array.from(result.data as Float32Array);
}

// Generate embeddings using Mistral API
async function embedWithMistral(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY not configured for document embeddings.");
  }
  const client = new Mistral({ apiKey });
  const response = await client.embeddings.create({
    model: "mistral-embed",
    inputs: texts,
  });
  return response.data.map(item => item.embedding);
}

export async function initRAG() {
  try {
    const docsPath = path.join(process.cwd(), "documents");
    
    if (!fs.existsSync(docsPath)) {
      console.warn("RAG: documents directory not found.");
      return;
    }

    const files = fs.readdirSync(docsPath);
    const contents: string[] = [];

    for (const file of files) {
      if (file.endsWith(".txt")) {
        const content = fs.readFileSync(path.join(docsPath, file), "utf-8");
        // Simple chunking by paragraph
        const chunks = content.split("\n\n").filter(c => c.trim().length > 0);
        contents.push(...chunks);
      }
    }

    if (contents.length === 0) {
      console.warn("RAG: No content found to index.");
      return;
    }

    // Check if we have a valid cache
    const newHashes = hashDocumentContents(contents);
    const cache = loadEmbeddingsCache();

    if (
      cache &&
      cache.version === "1" &&
      cache.documentHashes.combined === newHashes.combined &&
      cache.documents.length === contents.length
    ) {
      console.log(`RAG: Loaded ${cache.documents.length} chunks from cache.`);
      indexedDocs = cache.documents;
      return;
    }

    // Documents changed or no cache; recompute embeddings
    console.log(`RAG: Embedding ${contents.length} chunks with Mistral API...`);
    const embeddings = await embedWithMistral(contents);

    indexedDocs = contents.map((content, i) => ({
      content,
      embedding: embeddings[i],
    }));

    // Save to cache for future use
    saveEmbeddingsCache({
      version: "1",
      documentHashes: newHashes,
      documents: indexedDocs,
    });

    console.log(`RAG: Indexed ${indexedDocs.length} chunks.`);
  } catch (error) {
    console.error("RAG Initialization Error:", error);
  }
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function getContext(query: string): Promise<string> {
  if (indexedDocs.length === 0) return "";

  try {
    // Use local embedding for query to avoid API costs per message
    const queryEmbedding = await embedLocally(query);

    const scoredDocs = indexedDocs.map(doc => ({
      content: doc.content,
      score: cosineSimilarity(queryEmbedding, doc.embedding)
    }));

    // Sort by score and take top 3
    const topDocs = scoredDocs
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return topDocs.map(d => d.content).join("\n\n---\n\n");
  } catch (error) {
    console.error("RAG Retrieval Error:", error);
    return "";
  }
}
