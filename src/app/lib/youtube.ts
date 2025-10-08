import { YoutubeTranscript } from "youtube-transcript";

export async function getYoutubeTranscript(
  videoUrl: string
): Promise<string | null> {
  try {
    //extract video id from url

    const videoIdMatch = videoUrl.match(
      /(?:v=|\/)([0-9A-Za-z_-]{11})(?:\?|&|$)/
    );
    if (!videoIdMatch) {
      throw new Error("Invalid Youtube Url");
    }
    const videoId = videoIdMatch[1];

    const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptArray || transcriptArray.length === 0) return null;

    //convert transcript to single string
    const transcriptText = transcriptArray.map((t: any) => t.text).join(" ");

    return transcriptText.trim();
  } catch (error) {
    console.error("Failed to fetch Youtube transcript: ", error);
    return null;
  }
}
