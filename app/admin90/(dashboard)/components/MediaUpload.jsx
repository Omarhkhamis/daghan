"use client";

import { useState } from "react";
import Swal from "sweetalert2";

const MEDIA_ACCEPT =
  ".png,.jpg,.jpeg,.jfif,.webp,.gif,.svg,.mp4,image/png,image/jpeg,image/webp,image/gif,image/svg+xml,video/mp4";

export default function MediaUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Upload failed");
      }
      Swal.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1800,
        icon: "success",
        title: "Uploaded"
      });

      if (data?.url) {
        await navigator.clipboard.writeText(data.url);
      }

      window.location.reload();
    } catch (error) {
      Swal.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2600,
        icon: "error",
        title: "Upload failed",
        text: error?.message || "Upload failed"
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Upload</p>
      <p className="mt-2 text-sm text-slate-600">
        PNG, JPG, JPEG, JFIF, WEBP, GIF, SVG, MP4 supported. Max 50MB.
      </p>
      <p className="mt-1 text-xs text-slate-500">
        HEIC and AVIF are not supported in the dashboard uploader.
      </p>

      <div className="mt-4">
        <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300">
          {isUploading ? "Uploading..." : "Upload File"}
          <input
            type="file"
            className="hidden"
            accept={MEDIA_ACCEPT}
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
        <p className="mt-2 text-xs text-slate-500">
          The URL is copied automatically after upload.
        </p>
      </div>
    </div>
  );
}
