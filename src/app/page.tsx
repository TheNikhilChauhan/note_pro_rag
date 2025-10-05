import ChatBox from "@/components/ChatBox";
import Uploader from "@/components/Uploader";
import WebsiteUploader from "@/components/WebsiteUploader";
import YouTubeUploader from "@/components/YouTubeUploader";

export default function Home() {
  return (
    <div className="flex">
      <Uploader />
      <div>
        <YouTubeUploader />
      </div>
      <div>
        <WebsiteUploader />
      </div>
      <div>
        <ChatBox />
      </div>
    </div>
  );
}
