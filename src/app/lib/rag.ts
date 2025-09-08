import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { getQdrantClient } from "./qdrant";

export async function getRetriever(k = 4) {
  const qdrant = await getQdrantClient();

  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY!,
    model: process.env.OPENAI_EMBED_MODEL,
  });

  const vectorStore = new QdrantVectorStore(embeddings, {
    client: qdrant,
    collectionName: process.env.QDRANT_COLLECTION,
  });

  return vectorStore.asRetriever({ k });
}

//retireve relevant chunks from qdrant
export async function retireveDocs(query: string, k = 4) {
  if (!query || typeof query !== "string") {
    throw new Error(" Query must be a non-empty string");
  }

  try {
    const retriever = await getRetriever(k);
    return await retriever.invoke(query);
  } catch (error) {
    console.error("Retrieve docs error: ", error);
    return [];
  }
}
