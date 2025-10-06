import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { YoutubeTranscript } from "youtube-transcript";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ensureCollection, getQdrantClient } from "./qdrant";
import { QdrantVectorStore } from "@langchain/qdrant";
import { promises as fs } from "node:fs";
import { getYoutubeTranscript } from "./youtube";
import { Document as LangchainDocument } from "@langchain/core/documents";

interface IndexingProps {
  apiKey: string;
  fileType: string;
  fileUrl: string;
}

export class DocumentIndex {
  private apiKey: string;
  private fileType: string;
  private fileUrl: string;

  constructor({ apiKey, fileUrl, fileType }: IndexingProps) {
    this.apiKey = apiKey;
    this.fileUrl = fileUrl;
    this.fileType = fileType;
  }

  //main entry
  public async run() {
    const docs = await this.loadDocument();

    //embedding
    const embedding = new OpenAIEmbeddings({
      apiKey: this.apiKey,
      model: process.env.OPENAI_EMBED_MODEL,
    });

    const dimension = (await embedding.embedQuery("ping")).length;
    await ensureCollection(dimension);

    //add to qdrant
    const qdrant = await getQdrantClient();
    const vectorStore = await QdrantVectorStore.fromDocuments(docs, embedding, {
      client: qdrant,
      collectionName: process.env.QDRANT_COLLECTION,
    });
  }

  //loader dispatcher
  private async loadDocument(): Promise<Document[]> {
    //download file locally from cloudinary url
    const res = await fetch(this.fileUrl);
    if (!res.ok) throw new Error("Failed to fetch file");

    const buffer = Buffer.from(await res.arrayBuffer());

    switch (this.fileType) {
      case "application/pdf":
        return await new PDFLoader(new Blob([buffer])).load();
      case "text/csv":
        return await new CSVLoader(new Blob([buffer])).load();

      case "application/plain":
        return await new TextLoader(new Blob([buffer])).load();
      default:
        throw new Error(`Unsupported file type: ${this.fileType}`);
    }
  }

  public async runFromText(text: string) {
    const doc = [new LangchainDocument({ pageContent: text })];

    const embeddings = new OpenAIEmbeddings({
      apiKey: this.apiKey,
      model: "text-embedding-3-large",
    });

    const qdrant = await getQdrantClient();
    await QdrantVectorStore.fromDocuments(doc, embeddings, {
      client: qdrant,
      collectionName: process.env.QDRANT_COLLECTION,
    });
  }
}
