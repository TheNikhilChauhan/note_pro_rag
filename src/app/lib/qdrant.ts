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
export const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || "RAG_chunks";

let qdrantClient: QdrantClient | null = null;

// init client and we can reuse also
export async function getQdrantClient() {
  if (!qdrantClient) {
    if (!QDRANT_URL) {
      throw new Error("Qdrant url is missing in env variables");
    }
    qdrantClient = new QdrantClient({
      url: QDRANT_URL,
      apiKey: QDRANT_API_KEY,
    });
  }
  return qdrantClient;
}

/**
  Ensure a collection exists with the right vector dimension
 */
export async function ensureCollection(dimension: number) {
  const qdrantClient = await getQdrantClient();
  try {
    const existing = await qdrantClient.getCollection(QDRANT_COLLECTION);
    const currentDim = existing.config?.params?.vectors?.size ?? null;

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
export async function getVectorStore(
  embeddings?: EmbeddingsInterface
): Promise<QdrantVectorStore> {
  const embedder =
    embeddings ||
    new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY!,
      model: process.env.OPENAI_EMBED_MODEL || "text-embedding-3-large",
    });

  const client = await getQdrantClient();

  return new QdrantVectorStore(embedder, {
    client,
    collectionName: QDRANT_COLLECTION,
  });
}
