"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CheckoutState = {
  error?: string;
  orderNumber?: string;
};

type CartItemInput = { product_id: number; quantity: number };

export async function placeOrder(
  _prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión para finalizar el pedido." };
  }

  // 1) Parsear y validar los items enviados por el cliente.
  const itemsRaw = (formData.get("items") as string) ?? "[]";
  let items: CartItemInput[];
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    return {
      error: "El carrito no es válido. Recarga la página e inténtalo de nuevo.",
    };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { error: "El carrito está vacío." };
  }

  const cleaned: CartItemInput[] = [];
  for (const it of items) {
    const id = Number(it?.product_id);
    const qty = Number(it?.quantity);
    if (!Number.isInteger(id) || id <= 0) {
      return { error: "Uno de los productos del carrito no es válido." };
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      return { error: "Una de las cantidades del carrito no es válida." };
    }
    cleaned.push({ product_id: id, quantity: qty });
  }

  // Deduplicar (sumar cantidades por producto).
  const byId = new Map<number, number>();
  for (const it of cleaned) {
    byId.set(it.product_id, (byId.get(it.product_id) ?? 0) + it.quantity);
  }
  const deduped: CartItemInput[] = Array.from(byId.entries()).map(
    ([product_id, quantity]) => ({ product_id, quantity })
  );

  // 2) Datos del cliente.
  const customerName = ((formData.get("customer_name") as string) ?? "").trim();
  const customerPhone = ((formData.get("customer_phone") as string) ?? "").trim();
  const customerAddress = ((formData.get("customer_address") as string) ?? "").trim();
  const paymentMethod = ((formData.get("payment_method") as string) ?? "efectivo").trim();

  if (!customerName) return { error: "El nombre es obligatorio." };
  if (!customerPhone) return { error: "El teléfono es obligatorio." };
  if (!customerAddress) return { error: "La dirección es obligatoria." };
  if (!["efectivo", "tarjeta"].includes(paymentMethod)) {
    return { error: "Método de pago no válido." };
  }

  // 3) Crear el pedido de forma atómica en la BD (valida stock y precios).
  const { data: orderNumber, error } = await supabase.rpc("create_order", {
    p_items: deduped,
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_customer_address: customerAddress,
    p_customer_email: user.email ?? null,
    p_payment_method: paymentMethod,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("insuficiente")) {
      return {
        error:
          "No hay stock suficiente para completar tu pedido. Revisa las cantidades.",
      };
    }
    if (msg.includes("no existe")) {
      return { error: "Uno de los productos ya no está disponible." };
    }
    if (msg.includes("no tiene precio")) {
      return { error: "Uno de los productos no tiene precio definido." };
    }
    if (msg.includes("no autenticado")) {
      return { error: "Debes iniciar sesión para finalizar el pedido." };
    }
    if (msg.includes("carrito")) {
      return { error: "El carrito está vacío." };
    }
    if (msg.includes("cantidad")) {
      return { error: "Una de las cantidades no es válida." };
    }
    return { error: `No se pudo crear el pedido: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath("/admin");

  return { orderNumber: orderNumber as string };
}