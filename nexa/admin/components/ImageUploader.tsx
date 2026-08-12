"use client";

import { useState } from "react";

export function ImageUploader({
  value,
  onChange,
}: {
  value?: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const sigRes = await fetch("/api/upload-signature", { method: "POST" });
      if (!sigRes.ok) throw new Error(await sigRes.text());
      const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);

      // Uploads straight to Cloudinary from the browser — the file bytes
      // never touch our own servers, only the signature does.
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Upload to Cloudinary failed");
      const uploaded = await uploadRes.json();
      onChange(uploaded.secure_url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-20 w-20 rounded-md object-cover" />
      )}
      <input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="text-xs text-neutral-400"
      />
      {uploading && <span className="text-xs text-neutral-500">Uploading…</span>}
      {error && <span className="text-xs text-red-400">{error}</span>}
      {/* Falls back to a plain URL if Cloudinary isn't configured on the backend. */}
      <input
        type="text"
        name="imageUrl"
        placeholder="or paste an image URL"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs text-neutral-100"
      />
    </div>
  );
}
