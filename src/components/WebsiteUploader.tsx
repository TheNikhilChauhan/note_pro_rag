"use client";

import { useState } from "react";

interface Props {
  onContentIndexed?: (msg: string) => void;
}

export default function WebsiteUploader({ onContentIndexed }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async () => {
    if (!url.trim()) {
      setStatus("Please enter a valid website URL");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const formData = new FormData();
      formData.append("url", url);

      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        const successMsg = `Indexed website: ${data.source || url}`;
        setStatus(successMsg);
        onContentIndexed?.(successMsg);
      } else {
        const errorMsg = `${data.error || "Failed to index website"}`;
        setStatus(errorMsg);
        onContentIndexed?.(errorMsg);
      }
    } catch (error: any) {
      setStatus(`${error.message}`);
      onContentIndexed?.("Website indexing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-2xl shadow bg-gray-600">
      <input
        type="url"
        placeholder="Enter website link..."
        value={url}
        required
        onChange={(e) => setUrl(e.target.value)}
        className="p-2 border rounded-lg"
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 oy-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
      {status && <p>{status}</p>}
    </div>
  );
}
