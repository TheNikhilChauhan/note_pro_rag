"use client";

import { useState } from "react";

export default function WebsiteUploader({
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
      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Website indexing failed");

      setMessage("Website indexed successfully");
      setUrl("");
      onIndexed?.();
    } catch (error: any) {
      setMessage(`${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-2xl shadow bg-gray-600">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label className="font-medium">Website URL</label>
        <input
          type="url"
          placeholder="Enter website link..."
          value={url}
          required
          onChange={(e) => setUrl(e.target.value)}
          className="p-2 border rounded-lg"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 oy-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
