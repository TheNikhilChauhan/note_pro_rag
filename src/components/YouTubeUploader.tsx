"use client";

import { useState } from "react";

export default function YouTubeUploader({
  onIndexed,
}: {
  onIndexed?: () => void;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setMessage("");

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

      setMessage("Youtube video indexed successfully");
      setUrl("");
    } catch (error: any) {
      setMessage(`${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-2xl shadow bg-gray-600">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label className="font-medium">Youtube Video URL</label>
        <input
          type="url"
          placeholder="Enter youtube video link..."
          value={url}
          className="p-2 border rounded-lg"
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
