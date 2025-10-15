"use client";

import { useState } from "react";

interface Props {
  onContentIndexed: (message: string) => void;
}

export default function YouTubeUploader({ onContentIndexed }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!url) return;

    setLoading(true);

    try {
      const res = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Indexing failed");

      if (data.videoId) {
        onContentIndexed(`Video indexed successfully: ${data.videoId}`);
      } else {
        onContentIndexed(`Failed: ${data.error}`);
      }
    } catch (error: any) {
      onContentIndexed(`${error.message}`);
    } finally {
      setLoading(false);
      setUrl("");
    }
  };

  return (
    <div className="p-4 border rounded-2xl shadow bg-gray-500">
      <input
        type="url"
        placeholder="Enter youtube video link..."
        value={url}
        className="p-2 border rounded-lg w-full"
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
