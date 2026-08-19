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
    <div className="group flex animate-fade-up flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/productos/${product.slug}`} className="flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <img
            src={product.image_url || "/placeholder-vela.jpg"}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {outOfStock && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold text-white shadow">
              Sin stock
            </span>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-reny-purple-dark">
              Ver detalle
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-caveat text-2xl text-reny-purple-dark">
            {product.name}
          </h3>

          {chips.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-reny-purple/20 px-2 py-0.5 text-xs text-reny-purple-dark"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between pt-3">
            <p className="text-gradient text-lg font-bold">
              ${product.price ?? "—"}
            </p>
            {product.category && (
              <span className="rounded-full bg-reny-green px-2 py-0.5 text-xs text-white">
                {product.category.name}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className={`w-full rounded-lg py-2 text-sm font-bold transition ${
            outOfStock
              ? "cursor-not-allowed bg-gray-300 text-gray-500"
              : added
                ? "bg-reny-green text-reny-purple-dark"
                : "bg-gradient-to-r from-reny-purple to-reny-pink text-white hover:opacity-90"
          }`}
        >
          {outOfStock ? "Sin stock" : added ? "¡Agregado!" : "Agregar al carrito"}
        </button>
      </div>
    </div>
  );
}
