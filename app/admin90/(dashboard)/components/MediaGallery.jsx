"use client";

import Swal from "sweetalert2";

const isVideo = (url) => url.endsWith(".mp4");
const formatBytes = (size = 0) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export default function MediaGallery({ files }) {
  if (!files.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
        No uploads yet.
      </div>
    );
  }

  const handleCopy = async (url) => {
    await navigator.clipboard.writeText(url);
    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1400,
      icon: "success",
      title: "Copied"
    });
  };

  const handleDelete = async (file) => {
    const result = await Swal.fire({
      title: "Delete this file?",
      text: file.name,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    const response = await fetch(`/api/admin/uploads?name=${encodeURIComponent(file.name)}`, {
      method: "DELETE"
    });

    if (response.ok) {
      Swal.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1400,
        icon: "success",
        title: "Deleted"
      });
      window.location.reload();
      return;
    }

    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1600,
      icon: "error",
      title: "Delete failed"
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Library</p>
      <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => (
            <div
              key={file.url}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-200">
                <button
                  type="button"
                  onClick={() => handleDelete(file)}
                  className="absolute right-2 top-2 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                  aria-label={`Delete ${file.name}`}
                >
                  ×
                </button>
                {file.isEmpty ? (
                  <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                    Empty file
                  </div>
                ) : isVideo(file.url) ? (
                  <video
                    src={file.url}
                    className="h-full w-full object-cover"
                    muted
                    controls
                  />
                ) : (
                  <img
                    src={file.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-xs text-slate-500">{file.name}</div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    {formatBytes(file.size)}
                    {file.isEmpty ? " · Re-upload or delete" : ""}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(file.url)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 transition hover:border-slate-300"
                >
                  Copy URL
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
