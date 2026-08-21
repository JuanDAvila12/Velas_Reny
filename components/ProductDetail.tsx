"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";

export default function ProductDetail({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  const gallery = [product.image_url, ...(product.images ?? [])].filter(
    Boolean
  ) as string[];

  const outOfStock = product.stock != null && product.stock <= 0;
  const maxStock = product.stock != null && product.stock > 0 ? product.stock : 1;

  const details = [
    ["Aroma", product.aroma],
    ["Color", product.color],
    ["Tamaño", product.tamano],
    ["Intensidad", product.intensidad],
  ].filter(([, v]) => v) as [string, string][];

  function changeQuantity(delta: number) {
    setQuantity((q) => Math.max(1, Math.min(q + delta, maxStock)));
  }

  function handleAdd() {
    if (outOfStock) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="min-h-screen animate-fade-in px-4 py-12">
      <div className="glass mx-auto grid max-w-5xl gap-8 rounded-2xl p-8 shadow-xl md:grid-cols-2">
        {/* Galería */}
        <div>
          <div className="overflow-hidden rounded-xl">
            <img
              src={gallery[activeImage] || "/placeholder-vela.jpg"}
              alt={product.name}
              className="h-80 w-full rounded-xl object-cover shadow"
            />
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {gallery.map((g, i) => (
                <button
                  key={`${g}-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg transition ${
                    i === activeImage
                      ? "ring-2 ring-reni-pink-dark"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={g}
                    alt={`${product.name} ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información + compra */}
        <div className="space-y-4">
          <h1 className="text-4xl font-caveat text-reni-purple-dark">
            {product.name}
          </h1>

          {product.category && (
            <span className="inline-block rounded-full bg-reni-green px-3 py-1 text-sm text-white">
              {product.category.name}
            </span>
          )}

          <p className="text-gray-600">{product.description}</p>

          <p className="text-gradient text-3xl font-bold">
            ${product.price ?? "—"}
          </p>

          {product.stock != null && (
            <p
              className={`text-sm font-medium ${
                product.stock > 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {product.stock > 0
                ? `Stock disponible: ${product.stock}`
                : "Agotado — sin stock"}
            </p>
          )}

          {details.length > 0 && (
            <ul className="space-y-1 rounded-xl bg-white/60 p-4 text-sm">
              {details.map(([label, value]) => (
                <li key={label}>
                  <span className="font-semibold">{label}:</span> {value}
                </li>
              ))}
            </ul>
          )}

          {/* Cantidad */}
          {!outOfStock && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Cantidad:</span>
              <div className="flex items-center rounded-lg border border-reni-purple/60 bg-white/70">
                <button
                  type="button"
                  onClick={() => changeQuantity(-1)}
                  disabled={quantity <= 1}
                  className="px-3 py-2 text-lg font-bold text-reni-purple-dark transition hover:bg-reni-purple/20 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Disminuir cantidad"
                >
                  −
                </button>
                <span className="w-10 text-center font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => changeQuantity(1)}
                  disabled={quantity >= maxStock}
                  className="px-3 py-2 text-lg font-bold text-reni-purple-dark transition hover:bg-reni-purple/20 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            className={`mt-2 w-full rounded-lg py-3 font-bold text-white transition ${
              outOfStock
                ? "cursor-not-allowed bg-gray-400"
                : added
                  ? "bg-reni-green"
                  : "bg-gradient-to-r from-reni-purple to-reni-pink hover:opacity-90"
            }`}
          >
            {outOfStock
              ? "Agotado"
              : added
                ? "¡Agregado al carrito!"
                : "Agregar al carrito"}
          </button>

          <Link
            href="/productos"
            className="block text-center text-sm text-reni-purple-dark underline"
          >
            ← Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}