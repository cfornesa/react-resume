import { Mistral } from "@mistralai/mistralai";
import dotenv from "dotenv";

dotenv.config();

const PII_PATTERNS = {
  EMAIL: /[\w\.-]+@[\w\.-]+\.\w+/gi,
  PHONE: /\+?\d{1,4}?[-.\\s]?\(?\d{1,3}?\)?[-.\\s]?\d{1,4}[-.\\s]?\d{1,4}[-.\\s]?\d{1,9}/g,
  SSN: /\b(?!666|000|9\d{2})\d{3}[- ]?(?!00)\d{2}[- ]?(?!0000)\d{4}\b/g,
  ADDRESS: /\d{1,5}\s\w+.\s(\b\w+\b\s){1,2}\w+,\s\w+,\s[A-Z]{2}\s\d{5}/gi,
};

export function redactPII(text: string): string {
  let redacted = text;
  for (const [label, pattern] of Object.entries(PII_PATTERNS)) {
    redacted = redacted.replace(pattern, `[${label}_REDACTED]`);
  }
  return redacted;
}

export function stripMarkdown(text: string): string {
  let clean = text;
  // Handle links: [text](url) -> text (url)
  clean = clean.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');
  clean = clean.replace(/#{1,6}\s*/g, '');                    // headers
  clean = clean.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1');    // bold/italic
  clean = clean.replace(/_{1,2}([^_]+)_{1,2}/g, '$1');      // underline
  clean = clean.replace(/[\u2013\u2014]/g, '-');              // normalize unicode dashes
  clean = clean.replace(/[\u2600-\u27BF]/g, '');              // common symbols/emoji
  clean = clean.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]/g, '');  // extended emoji
  clean = clean.replace(/\n{3,}/g, '\n\n');                   // collapse excess blank lines
  return clean.trim();
}

export async function generateResponse(
  userInput: string,
  history: { role: string; content: string }[],
  context: string
) {
  const apiKey = process.env.MISTRAL_API_KEY;
  const agentId = process.env.AGENT_ID;

  if (!apiKey) throw new Error("MISTRAL_API_KEY not configured.");
  if (!agentId) throw new Error("AGENT_ID not configured.");

  const client = new Mistral({ apiKey });

  const safeInput = redactPII(userInput);
  
  const augmentedInput = context 
    ? `[Retrieved Reference Material]\n${context}\n\n[User Message]\n${safeInput}\n\n[Formatting Instruction]\nPlease provide the answer in clear, plain text using bullet points for lists and ensuring each section is separated by a newline for readability.`
    : safeInput;

  // The JS SDK beta conversations API might be different.
  // We'll use the standard chat completion with the agent_id if supported,
  // or use the beta conversations if available.
  // Based on Mistral documentation, agents are often called via chat.complete with agent_id.
  
  try {
    const response = await client.agents.complete({
      agentId: agentId,
      messages: [
        ...history.map(m => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content
        })),
        { role: "user", content: augmentedInput }
      ]
    });

    const replyText = response.choices?.[0]?.message?.content;

    if (!replyText || typeof replyText !== 'string') {
      throw new Error("Empty response from agent.");
    }

    return {
      reply: stripMarkdown(replyText),
      metadata: { status: "success" }
    };
  } catch (error) {
    console.error("Mistral API Error:", error);
    throw error;
  }
}
