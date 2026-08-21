"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const outOfStock = product.stock != null && product.stock <= 0;

  const chips = [
    product.aroma && `Aroma: ${product.aroma}`,
    product.color && `Color: ${product.color}`,
    product.tamano && product.tamano,
    product.intensidad && product.intensidad,
  ].filter(Boolean) as string[];

  function handleAdd() {
    if (outOfStock) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="group flex animate-fade-up flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/productos/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative h-32 overflow-hidden">
          <img
            src={product.image_url || "/placeholder-vela.jpg"}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {outOfStock && (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow">
              Sin stock
            </span>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-reni-purple-dark">
              Ver detalle
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-3">
          <h3 className="truncate text-sm font-semibold text-reni-purple-dark md:text-base">
            {product.name}
          </h3>

          {product.description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-gray-600 md:text-sm">
              {product.description}
            </p>
          )}

          {chips.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {chips.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-reni-purple/20 px-2 py-0.5 text-[10px] text-reni-purple-dark"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          <p
            className={`mt-1.5 text-xs font-medium ${
              outOfStock ? "text-red-500" : "text-green-600"
            }`}
          >
            Stock: {product.stock}
          </p>

          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <p className="text-base font-bold text-reni-pink-dark">
              ${product.price ?? "—"}
            </p>
            {product.category && (
              <span className="truncate rounded-full bg-reni-green px-2 py-0.5 text-[10px] text-white">
                {product.category.name}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className={`w-full rounded-full py-1 text-xs font-bold transition ${
            outOfStock
              ? "cursor-not-allowed bg-gray-300 text-gray-500"
              : added
                ? "bg-reni-green text-reni-purple-dark"
                : "bg-gradient-to-r from-reni-purple to-reni-pink text-white hover:opacity-90"
          }`}
        >
          {outOfStock ? "Sin stock" : added ? "Agregado" : "Agregar"}
        </button>
      </div>
    </div>
  );
}
