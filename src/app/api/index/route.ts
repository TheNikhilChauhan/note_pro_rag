import cloudinary from "@/app/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploaded = await cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder: "uploads" },
      (error, result) => {
        if (error) throw error;
        return result;
      }
    );

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

    return NextResponse.json({
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
