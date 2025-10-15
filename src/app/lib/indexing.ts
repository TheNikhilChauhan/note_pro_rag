import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ensureCollection, getQdrantClient } from "./qdrant";
import { QdrantVectorStore } from "@langchain/qdrant";
import fs from "fs";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import path from "path";

interface IndexingProps {
  apiKey: string;
  fileType?: string;
  fileUrl?: string;
  textContent?: string;
  collectionName?: string;
}

export class DocumentIndex {
  private apiKey: string;
  private fileType?: string;
  private fileUrl?: string;
  private textContent?: string;
  private collectionName?: string;

  constructor({
    apiKey,
    fileUrl,
    fileType,
    textContent,
    collectionName,
  }: IndexingProps) {
    this.apiKey = apiKey;
    this.fileUrl = fileUrl;
    this.fileType = fileType;
    this.textContent = textContent;
    this.collectionName = collectionName;
  }

  /** ------------------- MAIN ENTRY ------------------- **/
  public async run() {
    const docs = await this.loadDocument();
    if (!docs?.length) throw new Error("No documents to index");

    await this.indexDocuments(docs, this.fileUrl || "unknown_source");
  }

  /** ------------------- LOAD FROM URL ------------------- **/
  private async loadDocument(): Promise<Document[]> {
    if (!this.fileUrl || !this.fileType) {
      throw new Error("Missing file url or file type");
    }

    const res = await fetch(this.fileUrl);
    if (!res.ok) throw new Error("Failed to fetch file");

    const buffer = Buffer.from(await res.arrayBuffer());
    return this.loadFromBuffer(buffer, this.fileType);
  }

  /** ------------------- LOAD FROM BUFFER ------------------- **/
  private async loadFromBuffer(
    buffer: Buffer,
    fileType: string
  ): Promise<Document[]> {
    const tempDir = path.join(process.cwd(), "tmp");

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const tempFilePath = path.join(tempDir, `upload_${Date.now()}`);

    switch (fileType) {
      case "application/pdf": {
        const filePath = tempFilePath + ".pdf";
        fs.writeFileSync(filePath, buffer);
        return await new PDFLoader(filePath).load();
      }

      case "text/csv": {
        const filePath = tempFilePath + ".csv";
        fs.writeFileSync(filePath, buffer);
        return await new CSVLoader(filePath).load();
      }

      case "text/plain": {
        const filePath = tempFilePath + ".txt";
        fs.writeFileSync(filePath, buffer);
        return await new TextLoader(filePath).load();
      }

      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  /** ------------------- INDEX FROM BUFFER ------------------- **/
  public async runFromBuffer(
    buffer: Buffer,
    fileType: string,
    sourceUrl: string
  ) {
    const docs = await this.loadFromBuffer(buffer, fileType);
    await this.indexDocuments(docs, sourceUrl);
  }

  /** ------------------- INDEX FROM TEXT ------------------- **/
  public async runFromText(text: string, sourceName = "text_input") {
    const docs = [new Document({ pageContent: text })];
    await this.indexDocuments(docs, sourceName);
  }

  /** ------------------- CORE INDEXING LOGIC ------------------- **/
  private async indexDocuments(docs: Document[], sourceName: string) {
    // Split docs into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await splitter.splitDocuments(docs);

    // Enrich metadata
    const enrichedDocs = splitDocs.map((doc, index) => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        sourceType: "file",
        sourceName,
        pageNumber: doc.metadata?.loc?.pageNumber ?? doc.metadata?.page ?? null,
        chunkIndex: index,
        uploadedAt: new Date().toISOString(),
      },
    }));

    // Create embeddings
    const embeddings = new OpenAIEmbeddings({
      apiKey: this.apiKey,
      model: process.env.OPENAI_EMBED_MODEL || "text-embedding-3-large",
    });

    // Ensure Qdrant collection exists
    const qdrant = await getQdrantClient();
    const dim = (await embeddings.embedQuery("ping")).length;
    await ensureCollection(dim);

    // Push to Qdrant
    await QdrantVectorStore.fromDocuments(enrichedDocs, embeddings, {
      client: qdrant,
      collectionName: this.collectionName || process.env.QDRANT_COLLECTION!,
    });

    console.log("✅ Indexed successfully:", sourceName);
  }
}
