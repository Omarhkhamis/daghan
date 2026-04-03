import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4"
]);
const ALLOWED_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".jfif",
  ".webp",
  ".gif",
  ".svg",
  ".mp4"
]);
const SUPPORTED_FORMATS_LABEL =
  "PNG, JPG, JPEG, JFIF, WEBP, GIF, SVG, MP4";

const isSupportedFile = (file) => {
  const extension = path.extname(file.name || "").toLowerCase();
  return ALLOWED_TYPES.has(file.type) || ALLOWED_EXTENSIONS.has(extension);
};

export const POST = async (request) => {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 });
  }

  if (!isSupportedFile(file)) {
    return NextResponse.json(
      {
        error: `Unsupported file type. Use ${SUPPORTED_FORMATS_LABEL}. HEIC and AVIF are not supported.`
      },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Max size is 50MB." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const timestamp = Date.now();
  const safeName = path
    .basename(file.name || "upload")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${timestamp}-${safeName}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadsDir, { recursive: true, mode: 0o755 });
  await writeFile(path.join(uploadsDir, filename), buffer, { mode: 0o644 });

  return NextResponse.json({ url: `/uploads/${filename}` });
};
