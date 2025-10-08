import { DocumentIndex } from "@/app/lib/indexing";
import { getYoutubeTranscript } from "@/app/lib/youtube";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url, apiKey } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Missing Youtube Url" },
        { status: 400 }
      );
    }

    //get transcript

    const transcript = await getYoutubeTranscript(url);

    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        { error: "Transcript not available" },
        { status: 400 }
      );
    }

    const indexer = new DocumentIndex({
      apiKey,
      textContent: transcript,
      source: `youtube:${videoId}`,
    });
    await indexer.run();

    return NextResponse.json({
      message: "Youtube transcript indexed",
    });
  } catch (error: any) {
    console.error("Youtube API error: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
