import cloudinary from "@/app/lib/cloudinary";
import { DocumentIndex } from "@/app/lib/indexing";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    //promise wrapper for cloudinary
    const streamUpload = (buffer: Buffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "uploads" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(buffer);
      });

    const result: any = await streamUpload(buffer);

    const indexer = new DocumentIndex({
      apiKey: process.env.OPENAI_API_KEY!,
      textContent: buffer.toString("base64"),
      fileType: file.type,
      collectionName: process.env.QDRANT_COLLECTION!,
    });

    console.log(process.env.QDRANT_COLLECTION);

    await indexer.runFromBuffer(buffer, file.type, result.secure_url);

    return NextResponse.json({
      message: "File uploaded successfully",
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
