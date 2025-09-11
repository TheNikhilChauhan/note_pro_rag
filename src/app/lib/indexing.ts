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

interface IndexingProps {
  apiKey: string;
  filePath?: string;
  fileType?: string;
  textContent?: string;
  url?: string;
  youtubeUrl?: string;
}

export class DocumentIndex {
  private apiKey: string;
  private filePath?: string;
  private fileType?: string;
  private textContent?: string;
  private url?: string;
  private youtubeUrl?: string;

  constructor({
    apiKey,
    filePath,
    fileType,
    textContent,
    url,
    youtubeUrl,
  }: IndexingProps) {
    this.apiKey = apiKey;
    this.filePath = filePath;
    this.fileType = fileType;
    this.textContent = textContent;
    this.url = url;
    this.youtubeUrl = youtubeUrl;
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

    //Cleanup process of uploaded file
    if (this.filePath) {
      await fs.unlink(this.filePath).catch(() => {});
    }

    return vectorStore;
  }

  //loader dispatcher
  private async loadDocument(): Promise<Document[]> {
    //text
    if (this.textContent) {
      return [new Document({ pageContent: this.textContent })];
    }

    //website
    if (this.url) {
      const loader = new CheerioWebBaseLoader(this.url);
      return await loader.load();
    }

    //youtube-transcript
    if (this.youtubeUrl) {
      const transcript = await getYoutubeTranscript(this.youtubeUrl);
      if (!transcript) throw new Error("No transcript found for YouTube video");

      return [
        new Document({
          pageContent: transcript,
        }),
      ];
    }

    if (!this.filePath || !this.fileType) {
      throw new Error(
        "Please provide either textContent, url, youtube-url, or file-path/type"
      );
    }

    switch (this.fileType) {
      case "application/pdf":
        return await new PDFLoader(this.filePath).load();
      case "text/csv":
        return await new CSVLoader(this.filePath).load();
      case "text/plain":
      case "application/rtf":
        return await new TextLoader(this.filePath).load();
      default:
        throw new Error(`Unsupported file type: ${this.fileType}`);
    }
  }
}
