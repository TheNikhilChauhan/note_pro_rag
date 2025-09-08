import { DocumentIndex } from "@/app/lib/indexing";
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import { join } from "node:path";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const apiKey =
      (form.get("apiKey") as string) || process.env.OPENAI_API_KEY!;
    const file = form.get("file") as File | null;
    const text = form.get("text") as string | null;
    const url = form.get("url") as string | null;
    const youtubeUrl = form.get("youtubeUrl") as string | null;

    let filePath: string | undefined;
    let fileType: string | undefined;

    //upload file
    if (file) {
      const buf = Buffer.from(await file.arrayBuffer());
      filePath = join(process.cwd(), "tmp", `${Date.now()}-${file.name}`);
      fileType = file.type;
      await fs.writeFile(filePath, buf);
    }

    //create indexer
    const indexer = new DocumentIndex({
      apiKey,
      filePath,
      fileType,
      textContent: text || undefined,
      url: url || undefined,
      youtubeUrl: youtubeUrl || undefined,
    });

    const docsCount = await indexer.run();

    return NextResponse.json({
      ok: true,
      indexed: docsCount,
    });
  } catch (error: any) {
    console.error("Indexing failed: ", error);
    return NextResponse.json(
      { error: String(error.messge || error) },
      { status: 500 }
    );
  }
}
