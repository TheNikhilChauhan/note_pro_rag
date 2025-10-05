import ChatBox from "@/components/ChatBox";
import Uploader from "@/components/Uploader";
import WebsiteUploader from "@/components/WebsiteUploader";
import YouTubeUploader from "@/components/YouTubeUploader";
import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-500">
        Chat with Your Data
      </h1>
      <p className="text-lg text-gray-700 max-w-2xl mx-auto">
        Upload files, crawl websites, or analyze YouTube transcripts. Ask
        questions and get instant AI-powered answers.
      </p>

      <div className="flex justify-center gap-4">
        <Link
          href="/upload"
          className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Upload Files
        </Link>
        <Link
          href="/chat"
          className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700"
        >
          Start Chatting
        </Link>
      </div>
    </div>
  );
}
