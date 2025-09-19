import ChatBox from "@/components/ChatBox";
import Uploader from "@/components/Uploader";

export default function Home() {
  return (
    <div className="flex">
      <Uploader />
      <div>
        <ChatBox />
      </div>
    </div>
  );
}
