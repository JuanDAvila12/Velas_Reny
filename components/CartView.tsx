"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartView({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { items, totalItems, totalPrice, removeFromCart, updateQuantity, clearCart } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen px-4 py-12">
        <div className="glass mx-auto max-w-2xl animate-fade-up rounded-2xl p-8 text-center shadow-xl">
          <h1 className="mb-4 text-4xl font-caveat text-reni-purple-dark">
            Tu carrito
          </h1>
          <p className="mb-6 text-gray-600">Tu carrito está vacío.</p>
          <Link
            href="/productos"
            className="inline-block rounded-full bg-gradient-to-r from-reni-purple to-reni-pink px-8 py-3 font-bold text-white shadow transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 animate-fade-up text-center text-4xl font-caveat text-reni-purple-dark">
          Tu carrito
        </h1>

        <div className="glass rounded-2xl p-6 shadow-xl">
          <ul className="divide-y divide-gray-100">
            {items.map(({ product, quantity }) => (
              <li
                key={product.id}
                className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center"
              >
                <img
                  src={product.image_url || "/placeholder-vela.jpg"}
                  alt={product.name}
                  className="h-20 w-20 shrink-0 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <Link
                    href={`/productos/${product.slug}`}
                    className="font-semibold text-reni-purple-dark hover:underline"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-gray-500">
                    ${product.price ?? "—"} c/u
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    disabled={quantity <= 1}
                    className="h-8 w-8 rounded-lg bg-reni-purple/20 text-lg font-bold text-reni-purple-dark transition hover:bg-reni-purple/40 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Disminuir cantidad"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-bold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    disabled={product.stock != null && quantity >= product.stock}
                    className="h-8 w-8 rounded-lg bg-reni-purple/20 text-lg font-bold text-reni-purple-dark transition hover:bg-reni-purple/40 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>

                <div className="w-24 text-right font-bold">
                  ${((product.price ?? 0) * quantity).toFixed(2)}
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(product.id)}
                  className="text-sm text-red-500 underline hover:text-red-700"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col items-end gap-2 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600">
              {totalItems} artículo{totalItems === 1 ? "" : "s"}
            </p>
            <p className="text-gradient text-3xl font-bold">
              Total: ${totalPrice.toFixed(2)}
            </p>
            <button
              type="button"
              onClick={clearCart}
              className="text-sm text-red-500 underline hover:text-red-700"
            >
              Vaciar carrito
            </button>
          </div>

          <div className="mt-6">
            {isLoggedIn ? (
              <Link
                href="/checkout"
                className="block w-full rounded-lg bg-gradient-to-r from-reni-purple to-reni-pink py-3 text-center font-bold text-white shadow transition hover:opacity-90"
              >
                Finalizar pedido
              </Link>
            ) : (
              <Link
                href="/login"
                className="block w-full rounded-lg bg-gradient-to-r from-reni-purple to-reni-pink py-3 text-center font-bold text-white shadow transition hover:opacity-90"
              >
                Inicia sesión para comprar
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}