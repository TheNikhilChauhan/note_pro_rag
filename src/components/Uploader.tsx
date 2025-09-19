"use client";

import { Link, Upload, Youtube } from "lucide-react";
import { useState } from "react";

export default function Uploader() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await fetch("/api/index", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      alert(`✅ File uploaded: ${data.file || "done"}`);
    } catch (error) {
      console.error("Upload error: ", error);
      alert(" ❌ File upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = async (type: "website" | "youtube") => {
    if (!url.trim()) return;

    setLoading(true);

    try {
      const endpoint = type === "website" ? "/api/scrape" : "/api/youtube";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      alert(`✅ Indexed: ${data.message || url}`);
    } catch (error) {
      console.error("Url submit error: ", error);
      alert("❌ URL indexing failed");
    } finally {
      setLoading(false);
      setUrl("");
    }
  };

  return (
    <div className="p-6 border rounded-2xl shadow-xl max-w-xl mx-auto bg-gray-500 space-y-6">
      <h2 className="text-xl font-semibold text-gray-100">Upload Content</h2>

      {/* File upload */}

      <div>
        <input
          type="file"
          accept=".pdf, .txt, .csv"
          className="block w-full border p-2 rounded-lg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl flex gap-2 items-center cursor-pointer"
          disabled={!file || loading}
          onClick={handleFileUpload}
        >
          <Upload size={18} /> {loading ? "Uploading..." : "Upload File"}
        </button>
      </div>

      {/* Website/youtube url */}

      <div>
        <input
          type="text"
          placeholder="Enter your Website URL or Youtube URL"
          value={url}
          className="block w-full border p-2 rounded-xl"
          onChange={(e) => setUrl(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            onClick={() => handleUrlSubmit("website")}
            disabled={!url || loading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center cursor-pointer"
          >
            <Link size={18} /> Website
          </button>
          <button
            onClick={() => handleUrlSubmit("youtube")}
            disabled={!url || loading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center cursor-pointer"
          >
            <Youtube size={18} /> Youtube
          </button>
        </div>
      </div>
    </div>
  );
}
