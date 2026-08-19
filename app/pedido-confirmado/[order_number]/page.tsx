import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Order, OrderItem } from "@/lib/types";

export default async function PedidoConfirmadoPage({
  params,
}: {
  params: Promise<{ order_number: string }>;
}) {
  const { order_number } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", order_number)
    .maybeSingle();

  if (!data) notFound();

  const order = data as Order & { order_items: OrderItem[] };
  const items = Array.isArray(order.order_items) ? order.order_items : [];

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="glass mx-auto max-w-2xl animate-fade-up rounded-2xl p-8 text-center shadow-xl">
        <div className="mb-4 text-5xl" aria-hidden="true">
          🎉
        </div>
        <h1 className="mb-2 text-4xl font-caveat text-reny-purple-dark">
          ¡Pedido confirmado!
        </h1>
        <p className="mb-6 text-gray-600">
          Gracias por tu compra. Tu número de pedido es:
        </p>
        <p className="text-gradient mb-6 text-2xl font-bold">
          {order.order_number}
        </p>

        <div className="mb-6 rounded-xl bg-white/70 p-4 text-left">
          <ul className="divide-y divide-gray-100">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex justify-between gap-4 py-2 text-sm"
              >
                <span>
                  {it.quantity} × {it.product_name}
                </span>
                <span className="font-semibold">
                  ${Number(it.subtotal).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 font-bold">
            <span>Total</span>
            <span>${Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        <p className="mb-6 text-sm text-gray-500">
          Te contactaremos al {order.customer_phone ?? "teléfono"} para coordinar
          la entrega.
        </p>

        <Link
          href="/productos"
          className="inline-block rounded-full bg-gradient-to-r from-reny-purple to-reny-pink px-8 py-3 font-bold text-white shadow transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}