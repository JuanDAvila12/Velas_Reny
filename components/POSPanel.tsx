"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { createPosOrder, type PosOrderState } from "@/app/admin/pos-actions";
import type { PosProduct } from "@/lib/types";

const initialState: PosOrderState = {};

interface TicketLine {
  product: PosProduct;
  quantity: number;
}

export default function POSPanel({ products }: { products: PosProduct[] }) {
  const [search, setSearch] = useState("");
  const [ticket, setTicket] = useState<TicketLine[]>([]);
  const [state, formAction, pending] = useActionState(
    createPosOrder,
    initialState
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || String(p.id).includes(q)
    );
  }, [products, search]);

  const total = ticket.reduce(
    (sum, t) => sum + (t.product.price ?? 0) * t.quantity,
    0
  );

  function addToTicket(product: PosProduct) {
    if (product.stock <= 0) return;
    setTicket((prev) => {
      const existing = prev.find((t) => t.product.id === product.id);
      const max = product.stock > 0 ? product.stock : Number.POSITIVE_INFINITY;
      if (existing) {
        return prev.map((t) =>
          t.product.id === product.id
            ? { ...t, quantity: Math.min(t.quantity + 1, max) }
            : t
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function updateQuantity(id: number, delta: number) {
    setTicket((prev) =>
      prev.map((t) => {
        if (t.product.id !== id) return t;
        const max =
          t.product.stock > 0 ? t.product.stock : Number.POSITIVE_INFINITY;
        const next = Math.max(1, Math.min(t.quantity + delta, max));
        return { ...t, quantity: next };
      })
    );
  }

  function removeFromTicket(id: number) {
    setTicket((prev) => prev.filter((t) => t.product.id !== id));
  }

  useEffect(() => {
    if (state?.orderNumber) {
      setTicket([]);
    }
  }, [state]);

  const itemsJson = JSON.stringify(
    ticket.map((t) => ({ product_id: t.product.id, quantity: t.quantity }))
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Buscador y resultados */}
      <div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o código..."
          className="w-full rounded-lg border border-reni-purple/60 bg-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-reni-pink"
        />
        <ul className="mt-4 max-h-96 divide-y divide-gray-100 overflow-y-auto rounded-xl bg-white/70">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 px-4 py-2"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{p.name}</p>
                <p className="text-xs text-gray-500">
                  #{p.id} · ${p.price ?? "—"} · stock {p.stock}
                </p>
              </div>
              <button
                type="button"
                onClick={() => addToTicket(p)}
                disabled={p.stock <= 0}
                className="shrink-0 rounded-lg bg-reni-purple px-3 py-1.5 text-sm font-bold text-white transition hover:bg-reni-purple-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {p.stock <= 0 ? "Sin stock" : "Agregar"}
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-gray-500">
              Sin resultados.
            </li>
          )}
        </ul>
      </div>

      {/* Ticket */}
      <form action={formAction} className="rounded-xl bg-white/70 p-4">
        <h3 className="mb-3 text-2xl font-caveat text-reni-purple-dark">
          Ticket
        </h3>

        <input type="hidden" name="items" value={itemsJson} />

        {state?.error && (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {state.error}
          </p>
        )}
        {state?.orderNumber && (
          <p className="mb-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            Venta registrada: {state.orderNumber}
          </p>
        )}

        <ul className="max-h-64 divide-y divide-gray-100 overflow-y-auto">
          {ticket.map((t) => (
            <li
              key={t.product.id}
              className="flex items-center gap-3 py-2 text-sm"
            >
              <div className="flex-1">
                <p className="font-medium">{t.product.name}</p>
                <p className="text-xs text-gray-500">
                  ${t.product.price ?? "—"} c/u
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateQuantity(t.product.id, -1)}
                  disabled={t.quantity <= 1}
                  className="h-7 w-7 rounded bg-reni-purple/20 font-bold text-reni-purple-dark disabled:opacity-40"
                  aria-label="Disminuir"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold">{t.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(t.product.id, 1)}
                  className="h-7 w-7 rounded bg-reni-purple/20 font-bold text-reni-purple-dark"
                  aria-label="Aumentar"
                >
                  +
                </button>
              </div>
              <span className="w-20 text-right font-bold">
                ${((t.product.price ?? 0) * t.quantity).toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => removeFromTicket(t.product.id)}
                className="text-red-500 hover:text-red-700"
                aria-label="Quitar del ticket"
              >
                ✕
              </button>
            </li>
          ))}
          {ticket.length === 0 && (
            <li className="py-6 text-center text-sm text-gray-500">
              Ticket vacío.
            </li>
          )}
        </ul>

        <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 text-lg font-bold">
          <span>Total</span>
          <span className="text-gradient">${total.toFixed(2)}</span>
        </div>

        <div className="mt-4 space-y-3">
          <input
            name="customer_name"
            placeholder="Nombre del cliente (opcional)"
            className="w-full rounded-lg border border-reni-purple/60 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-reni-pink"
          />
          <textarea
            name="notes"
            rows={2}
            placeholder="Nota (opcional)"
            className="w-full rounded-lg border border-reni-purple/60 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-reni-pink"
          />
          <button
            type="submit"
            disabled={pending || ticket.length === 0}
            className="w-full rounded-lg bg-gradient-to-r from-reni-purple to-reni-pink py-3 font-bold text-white shadow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Cobrando..." : `Cobrar $${total.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
}