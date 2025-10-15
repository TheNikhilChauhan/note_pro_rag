"use client";

import { useState } from "react";

import Uploader from "@/components/Uploader";
import YouTubeUploader from "@/components/YouTubeUploader";
import ChatInterface from "@/components/ChatInterface";
import WebsiteUploader from "@/components/WebsiteUploader";

export default function Dashboard() {
  const [messages, setMessages] = useState<string[]>([]);

  const handleLog = (msg: string) => setMessages((prev) => [...prev, msg]);

  return (
    <div className="min-h-screen bg-gray-600">
      <header className="bg-red-600 text-white p-4 text-xl font-bold">
        AI Mind Dashboard
      </header>
      <main className="p-6 space-y-6">
        <section className="grid md:grid-cols-3 gap-6">
          <Uploader onContentIndexed={handleLog} />
          <WebsiteUploader onContentIndexed={handleLog} />
          <YouTubeUploader onContentIndexed={handleLog} />
        </section>

        <section className="bg-gray-500 p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Activity Log</h2>
          <div className="h-40 overflow-y-auto border p-2 rounded">
            {messages.length ? (
              messages.map((m, i) => (
                <div key={i} className="text-sm">
                  {m}
                </div>
              ))
            ) : (
              <div className="text-gray-300 text-sm">No activity yet.</div>
            )}
          </div>
        </section>

        <section className="bg-gray-500 p-4 rounded shadow">
          <ChatInterface />
        </section>
      </main>
      <footer className="bg-gray-200 text-gray-700 p-4 text-center">
        © 2025 AI Knowledge Base
      </footer>
    </div>
  );
}
