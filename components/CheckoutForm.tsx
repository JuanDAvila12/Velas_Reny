"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { placeOrder, type CheckoutState } from "@/app/checkout/actions";

const initialState: CheckoutState = {};

const inputClass =
  "w-full rounded-lg border border-reny-purple/60 bg-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-reny-pink";

export default function CheckoutForm({
  profile,
}: {
  profile: {
    full_name: string | null;
    phone: string | null;
    address: string | null;
  };
}) {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [state, formAction, pending] = useActionState(placeOrder, initialState);

  const itemsJson = JSON.stringify(
    items.map((i) => ({ product_id: i.product.id, quantity: i.quantity }))
  );

  // Al confirmar con éxito, limpiamos el carrito y redirigimos.
  useEffect(() => {
    if (state?.orderNumber) {
      clearCart();
      router.push(`/pedido-confirmado/${state.orderNumber}`);
    }
  }, [state, clearCart, router]);

  if (items.length === 0 && !state?.orderNumber) {
    return (
      <div className="min-h-screen px-4 py-12">
        <div className="glass mx-auto max-w-xl animate-fade-up rounded-2xl p-8 text-center shadow-xl">
          <h1 className="mb-4 text-3xl font-caveat text-reny-purple-dark">
            Finalizar pedido
          </h1>
          <p className="mb-6 text-gray-600">No tienes productos en el carrito.</p>
          <Link
            href="/productos"
            className="inline-block rounded-full bg-gradient-to-r from-reny-purple to-reny-pink px-8 py-3 font-bold text-white shadow transition hover:-translate-y-0.5"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
        {/* Resumen del pedido */}
        <div className="glass h-fit rounded-2xl p-6 shadow-xl">
          <h2 className="mb-4 text-2xl font-caveat text-reny-purple-dark">
            Resumen del pedido
          </h2>
          <ul className="divide-y divide-gray-100">
            {items.map(({ product, quantity }) => (
              <li
                key={product.id}
                className="flex justify-between gap-4 py-2 text-sm"
              >
                <span>
                  {quantity} × {product.name}
                </span>
                <span className="font-semibold">
                  ${((product.price ?? 0) * quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-gray-200 pt-3 text-lg font-bold">
            <span>Total</span>
            <span className="text-gradient">${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Formulario de envío */}
        <form action={formAction} className="glass rounded-2xl p-6 shadow-xl">
          <h2 className="mb-4 text-2xl font-caveat text-reny-purple-dark">
            Datos de envío
          </h2>

          <input type="hidden" name="items" value={itemsJson} />

          {state?.error && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {state.error}
            </p>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Nombre completo *
              </label>
              <input
                name="customer_name"
                required
                defaultValue={profile.full_name ?? ""}
                className={inputClass}
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Teléfono *</label>
              <input
                name="customer_phone"
                required
                defaultValue={profile.phone ?? ""}
                className={inputClass}
                placeholder="10 dígitos"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Dirección de entrega *
              </label>
              <input
                name="customer_address"
                required
                defaultValue={profile.address ?? ""}
                className={inputClass}
                placeholder="Calle, número, colonia..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Método de pago
              </label>
              <select
                name="payment_method"
                defaultValue="efectivo"
                className={inputClass}
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-gradient-to-r from-reny-purple to-reny-pink py-3 font-bold text-white shadow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Procesando..." : "Confirmar pedido"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}