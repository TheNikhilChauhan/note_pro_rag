// src/lib/qdrant.ts
import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import type { EmbeddingsInterface } from "@langchain/core/embeddings";
import dotenv from "dotenv";
dotenv.config();

// env vars
const QDRANT_URL = process.env.QDRANT_URL!;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
export const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || "rag_chunks";

// init client
export const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY || undefined,
  // skips version check (avoids annoying startup errors in dev)
  checkCompatibility: process.env.QDRANT_SKIP_COMPATIBILITY_CHECK === "true",
});

/**
 * Ensure a collection exists with the right vector dimension
 */
export async function ensureCollection(dimension: number) {
  try {
    const existing = await qdrantClient.getCollection(QDRANT_COLLECTION);
    const currentDim =
      existing.config?.params?.vectors?.size ||
      existing.status?.optimizers_status?.default_segment_number;

    if (currentDim && currentDim !== dimension) {
      console.warn(
        `⚠️ Collection ${QDRANT_COLLECTION} has dim ${currentDim}, expected ${dimension}. Recreating...`
      );
      await qdrantClient.deleteCollection(QDRANT_COLLECTION);
      await qdrantClient.createCollection(QDRANT_COLLECTION, {
        vectors: { size: dimension, distance: "Cosine" },
      });
    }
  } catch {
    console.log(`ℹ️ Creating new Qdrant collection: ${QDRANT_COLLECTION}`);
    await qdrantClient.createCollection(QDRANT_COLLECTION, {
      vectors: { size: dimension, distance: "Cosine" },
    });
  }
}

/**
  get vector store instance
 */
export function getVectorStore(
  embeddings?: EmbeddingsInterface
): QdrantVectorStore {
  const embedder =
    embeddings ||
    new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY!,
      model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-large",
    });

  return new QdrantVectorStore(embedder, {
    client: qdrantClient,
    collectionName: QDRANT_COLLECTION,
  });
}
