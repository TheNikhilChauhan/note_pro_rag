import { EmbeddingsInterface } from "@langchain/core/embeddings";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

const PROVIDER = process.env.LLM_PROVIDER || "openai";

// embedding model for indexing and retrieval
export function getEmbeddingModel(): EmbeddingsInterface {
  if (PROVIDER === "gemini") {
    return new ChatGoogleGenerativeAI({
      apiKey: process.env.Gemini_API_KEY,
      model: process.env.GEMINI_EMBEDDING_MODEL || "embedding-001",
    }) as unknown as EmbeddingsInterface;
  }

  //openai embeddings
  return new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_EMBED_MODEL,
  });
}

// chat model for answering queries
export function getChatModel() {
  if (PROVIDER === "gemini") {
    return new ChatGoogleGenerativeAI({
      model: process.env.Gemini_model || "gemini-2.0-flash",
      apiKey: process.env.Gemini_API_KEY,
    });
  }

  //openai chat
  return new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_CHAT_MODEL,
    streaming: true,
  });
}
