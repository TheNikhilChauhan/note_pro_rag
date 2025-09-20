import { crawlWebsite } from "@/app/lib/crawler";
import { DocumentIndex } from "@/app/lib/indexing";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    const pages = await crawlWebsite(url, 20);
    if (!pages.length) {
      return NextResponse.json({ error: "No content found" }, { status: 404 });
    }

    const textContent = pages
      .map((p) => `URL: ${p.url}\n\n${p.text}`)
      .join("\n\n--\n\n");

    const indexer = new DocumentIndex({
      textContent,
    });
    await indexer.run();

    return NextResponse.json({ message: "Website indexed successfully" });
  } catch (error: any) {
    console.error("Scrape error: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
