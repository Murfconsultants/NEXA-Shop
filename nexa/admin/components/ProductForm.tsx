"use client";

import { useState } from "react";
import { ImageUploader } from "./ImageUploader";

export function ProductForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [imageUrl, setImageUrl] = useState("");

  return (
    <form action={action} className="flex flex-col gap-3">
      <LabeledInput name="name" label="Name" required />
      <LabeledInput name="description" label="Description" />
      <LabeledInput name="price" label="Price (USDC, e.g. 24.99)" required />
      <LabeledInput name="inventory" label="Inventory" type="number" required />

      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        Image
        <ImageUploader value={imageUrl} onChange={setImageUrl} />
      </label>

      <button className="mt-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium hover:bg-blue-500">
        Create
      </button>
    </form>
  );
}

function LabeledInput({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-neutral-400">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-100"
      />
    </label>
  );
}
