import Link from "next/link";
import Dashboard from "./dashboard/page";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center text-center py-20 px-6">
      <h2 className="text-4xl font-bold mb-4">Your AI Research Assistant</h2>
      <p className="text-lg text-gray-300 mb-6 max-w-xl">
        Upload PDFs, scrape websites, analyze Youtube transcripts, and chat with
        all your knowledge in one place.
      </p>
      <div className="flex space-x-4 font-semibold">
        <Link
          href="/chat"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Start Chatting
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 text-blue-600 rounded-lg hover:bg-blue-50 border border-blue-600"
        >
          Upload Docs
        </Link>
      </div>
    </div>
  );
}
