import { crawlWebsite } from "@/app/lib/crawler";
import { DocumentIndex } from "@/app/lib/indexing";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const pages = await crawlWebsite(url, 50);
    if (!pages.length) {
      return NextResponse.json({ error: "No pages found" }, { status: 404 });
    }

    const textContent = pages
      .map((p) => `URL: ${p.url}\n\n${p.text}`)
      .join("\n\n---\n\n");

    const indexer = new DocumentIndex({
      apiKey: process.env.OPENAI_API_KEY!,
      fileUrl: "",
      fileType: "text/plain",
    });

    await indexer.runFromText(textContent);
  } catch (error: any) {
    console.error("Crawl error: ", error);
    return NextResponse.json(
      { error: error.message || String(error) },
      { status: 500 }
    );
  }
}
