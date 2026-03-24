import { Mistral } from "@mistralai/mistralai";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

interface Document {
  content: string;
  embedding: number[];
}

let indexedDocs: Document[] = [];

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

export async function initRAG() {
  try {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      console.warn("RAG: MISTRAL_API_KEY not found.");
      return;
    }

    const client = new Mistral({ apiKey });
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

    console.log(`RAG: Embedding ${contents.length} chunks...`);
    
    // Mistral embed API supports batching
    const response = await client.embeddings.create({
      model: "mistral-embed",
      inputs: contents,
    });

    indexedDocs = contents.map((content, i) => ({
      content,
      embedding: response.data[i].embedding,
    }));

    console.log(`RAG: Indexed ${indexedDocs.length} chunks.`);
  } catch (error) {
    console.error("RAG Initialization Error:", error);
  }
}

export async function getContext(query: string): Promise<string> {
  if (indexedDocs.length === 0) return "";

  try {
    const apiKey = process.env.MISTRAL_API_KEY;
    const client = new Mistral({ apiKey });

    const response = await client.embeddings.create({
      model: "mistral-embed",
      inputs: [query],
    });

    const queryEmbedding = response.data[0].embedding;

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
