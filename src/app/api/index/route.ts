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

    let filePath: string | undefined;
    let fileType: string | undefined;
    let textContent = "";

    //upload file
    if (file) {
      const buf = Buffer.from(await file.arrayBuffer());
      filePath = join(process.cwd(), "tmp", `${Date.now()}-${file.name}`);
      fileType = file.type;
      await fs.writeFile(filePath, buf);

      //create indexer
      const indexer = new DocumentIndex({
        apiKey,
        filePath,
        fileType,
      });

      await indexer.run();

      return NextResponse.json({
        message: "File indexed successfully",
      });
    }

    // crawl website
    if (url) {
      const pages = await crawlWebsite(url, 50);
      if (!pages.length) {
        return NextResponse.json({ error: "No Pages found" }, { status: 404 });
      }

      textContent = pages
        .map((page) => `Url: ${page.url}\n\n${page.text}`)
        .join("\n\n---\n\n");

      const indexer = new DocumentIndex({
        apiKey: apiKey ?? process.env.OPENAI_API_KEY!,
        textContent,
      });

      await indexer.run();
      return NextResponse.json({ message: "Website indexed successfully" });
    }

    //Youtube transcript
    if (youtubeUrl) {
      const transcript = await getYoutubeTranscript(youtubeUrl);

      if (!transcript) {
        return NextResponse.json(
          { error: "Failed to fetch Youtube transcript" },
          { status: 404 }
        );
      }

      const indexer = new DocumentIndex({
        apiKey: apiKey ?? process.env.OPENAI_API_KEY!,
        textContent: transcript,
      });

      await indexer.run();
      return NextResponse.json({
        message: "Youtube transcript indexed",
      });
    }

    return NextResponse.json(
      { error: "No valid input provided" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Indexing failed: ", error);
    return NextResponse.json(
      { error: String(error.messge || error) },
      { status: 500 }
    );
  }
}
