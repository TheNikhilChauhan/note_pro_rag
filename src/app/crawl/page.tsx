"use client";

import { useState } from "react";

export default function CrawlPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCrawl = async () => {
    if (!url) return alert("Please enter a website URL");

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Website indexed successfully");
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto text-center space-y-6">
      <h1 className="text-3xl font-bold">Crawl a Website</h1>
      <p className="text-gray-600">Enter a website URL to extract text</p>

      <input
        type="url"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button
        onClick={handleCrawl}
        disabled={loading}
        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Crawling..." : "Crawl"}
      </button>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
