import { crawlWebsite } from "@/app/lib/crawler";
import { DocumentIndex } from "@/app/lib/indexing";
import { getYoutubeTranscript } from "@/app/lib/youtube";
import { NextRequest, NextResponse } from "next/server";

import { promises as fs } from "node:fs";
import { join } from "node:path";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const apiKey =
      (form.get("apiKey") as string) || process.env.OPENAI_API_KEY!;
    const file = form.get("file") as File | null;

    const url = form.get("url") as string | null;
    const youtubeUrl = form.get("youtubeUrl") as string | null;

    let fileUrl: string | undefined;
    let fileType: string | undefined;
    let textContent = "";
    let indexer: DocumentIndex;

    //upload file
    if (fileUrl && fileType) {
      //create indexer
      indexer = new DocumentIndex({
        apiKey,
        fileUrl,
        fileType,
      });
    }

    // crawl website
    else if (url) {
      const pages = await crawlWebsite(url, 50);
      if (!pages.length) {
        return NextResponse.json({ error: "No Pages found" }, { status: 404 });
      }

      textContent = pages
        .map((page) => `Url: ${page.url}\n\n${page.text}`)
        .join("\n\n---\n\n");

      indexer = new DocumentIndex({
        apiKey: apiKey ?? process.env.OPENAI_API_KEY!,
        textContent,
      });
    }

    //Youtube transcript
    else if (youtubeUrl) {
      const transcript = await getYoutubeTranscript(youtubeUrl);

      if (!transcript) {
        return NextResponse.json(
          { error: "Failed to fetch Youtube transcript" },
          { status: 404 }
        );
      }

      indexer = new DocumentIndex({
        apiKey: apiKey ?? process.env.OPENAI_API_KEY!,
        textContent: transcript,
      });
    } else {
      return NextResponse.json(
        { error: "No valid input provided" },
        { status: 400 }
      );
    }
    await indexer.run();

    return NextResponse.json({
      ok: true,
      source: file?.name || url || youtubeUrl,
    });
  } catch (error: any) {
    console.error("Indexing failed: ", error);
    return NextResponse.json(
      { error: String(error.messge || error) },
      { status: 500 }
    );
  }
}
