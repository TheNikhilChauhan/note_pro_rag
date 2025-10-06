import { DocumentIndex } from "@/app/lib/indexing";
import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "Missing Youtube Url" },
        { status: 400 }
      );
    }

    const transcript = await YoutubeTranscript.fetchTranscript(url);

    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        { error: "Transcript not available" },
        { status: 400 }
      );
    }
    const textContent = transcript.map((t) => t.text).join(" ");

    const indexer = new DocumentIndex({
      apiKey: process.env.OPENAI_API_KEY!,
      fileUrl: "",
      fileType: "text/plain",
    });
    await indexer.runFromText(textContent);

    return NextResponse.json({
      message: "Youtube transcript indexed",
    });
  } catch (error: any) {
    console.error("Youtube API error: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
