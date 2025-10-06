"use client";

import { useState } from "react";

export default function YoutubePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!url) return alert("Please enter a Youtube link");
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Youtube transcript indexed successfully");
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
    <div className="max-wlg mx-auto text-center space-y-6">
      <h1 className="text-2xl font-bold">Index Youtube Video</h1>
      <p className="text-gray-500">
        Paste a Youtube link to fetch transcript and index it
      </p>

      <input
        type="url"
        placeholder="https://www.youtube.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 cursor-pointer font-semibold"
      >
        {loading ? "Fetching..." : "Fetch"}
      </button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
