"use client";

import { useState } from "react";

interface Props {
  onContentIndexed: (message: string) => void;
}

export default function Uploader({ onContentIndexed }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async () => {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.url) {
        onContentIndexed(`File uploaded successfully: ${data.url}`);
      } else {
        onContentIndexed(`Upload failed: ${data.error}`);
      }
    } catch (error: any) {
      onContentIndexed(`Upload error: ${error.message}`);
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  return (
    <div className="p-4 bg-gray-500 rounded-2xl shadow-xl space-y-6">
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
        {loading ? "Uploading..." : "Upload File"}
      </button>
    </div>
  );
}
