import axios from "axios";

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

    const res = await axios.get(
      `https://yt.lemnoslife.com/videos?part=transcript&id=${videoId}`
    );

    const transcriptItems = res.data?.items?.[0]?.transcript?.transcriptParts;
    if (!transcriptItems) return null;

    //convert transcript to single string
    const transcriptText = transcriptItems.map((t: any) => t.text).join(" ");

    return transcriptText.trim();
  } catch (error) {
    console.error("Failed to fetch Youtube transcript: ", error);
    return null;
  }
}
