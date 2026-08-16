"use client";

import { useState, useTransition } from "react";
import { ImageUploader } from "./ImageUploader";
import { updateProductImage } from "@/app/products/actions";

export function ProductImageEditor({
  productId,
  imageUrl,
}: {
  productId: string;
  imageUrl?: string;
}) {
  const [current, setCurrent] = useState(imageUrl);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleChange = (url: string) => {
    setCurrent(url);
    startTransition(async () => {
      await updateProductImage(productId, url);
      setOpen(false);
    });
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="block">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt="" className="h-10 w-10 rounded-md object-cover" />
        ) : (
          <div className="h-10 w-10 rounded-md bg-neutral-800" />
        )}
      </button>
      {open && (
        <div className="absolute left-0 top-12 z-10 w-56 rounded-md border border-neutral-700 bg-neutral-900 p-3 shadow-lg">
          <ImageUploader value={current} onChange={handleChange} />
          {isPending && <p className="mt-2 text-xs text-neutral-500">Saving…</p>}
        </div>
      )}
    </div>
  );
}
