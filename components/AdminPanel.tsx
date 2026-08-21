"use client";

import ProductForm from "./ProductForm";
import type { AdminProduct } from "@/lib/types";

export default function AdminPanel({
  categories,
  product,
  onSaved,
  onCancelEdit,
}: {
  categories: { id: number; name: string }[];
  product?: AdminProduct | null;
  onSaved?: () => void;
  onCancelEdit?: () => void;
}) {
  return (
    <div className="space-y-4">
      {product && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-reni-purple/40 bg-white/60 p-4">
          <p className="text-sm text-gray-600">
            Editando:{" "}
            <span className="font-semibold text-reni-purple-dark">
              {product.name}
            </span>
          </p>
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-lg bg-white/70 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-white"
          >
            Cancelar edición
          </button>
        </div>
      )}

      <ProductForm
        key={product?.id ?? "new"}
        categories={categories}
        product={product}
        onSaved={onSaved}
      />
    </div>
  );
}
