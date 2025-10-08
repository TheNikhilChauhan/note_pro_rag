"use client";

import { useUser } from "@clerk/clerk-react";
import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      //upload to cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_present", process.env.CLOUDINARY_PRESENT!);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env
          .CLOUDINARY_CLOUD_NAME!}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const cloudinaryData = await cloudinaryRes.json();

      if (!cloudinaryData.secure_url) {
        throw new Error("Cloudinary upload failed");
      }

      //cloudinary url to backend
      const apiRes = await fetch("/api/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl: cloudinaryData.secure_url,
          fileType: file.type,
        }),
      });

      const result = await apiRes.json();

      if (!apiRes.ok) {
        throw new Error(result.error || "Indexing failed");
      }

      setMessage("File uploaded and indexed successfully");
    } catch (error: any) {
      setMessage(`${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 flex flex-col items-center gap-2">
      <h1 className="text-3xl font-bold mb-6">Upload a File</h1>
      <p>Supported: PDF, TXT, CSV</p>

      <input
        type="file"
        accept=".pdf,.csv,.txt,.rtf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className=" text-xl text-gray-300  cursor-pointer items-center  text-center"
      />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="gap-2 border px-4 py-2 rounded-xl bg-blue-600 cursor-pointer hover:bg-blue-700 font-semibold"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
      {message && <p className="mt-4 text-center text-gray-600">{message}</p>}
    </div>
  );
}
