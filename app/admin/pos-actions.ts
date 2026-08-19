"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/admin";

export type PosOrderState = {
  error?: string;
  orderNumber?: string;
};

type TicketItem = { product_id: number; quantity: number };

export async function createPosOrder(
  _prevState: PosOrderState,
  formData: FormData
): Promise<PosOrderState> {
  if (!(await isAdmin())) {
    return { error: "No autorizado." };
  }

  const supabase = await createClient();

  const itemsRaw = (formData.get("items") as string) ?? "[]";
  const customerName = ((formData.get("customer_name") as string) ?? "").trim();
  const notes = ((formData.get("notes") as string) ?? "").trim();

  let items: TicketItem[];
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    return { error: "El ticket no es válido." };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Agrega productos al ticket." };
  }

  for (const it of items) {
    const id = Number(it?.product_id);
    const qty = Number(it?.quantity);
    if (!Number.isInteger(id) || id <= 0) {
      return { error: "Uno de los productos del ticket no es válido." };
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      return { error: "Una de las cantidades no es válida." };
    }
  }

  const { data: orderNumber, error } = await supabase.rpc("create_pos_order", {
    p_items: items,
    p_customer_name: customerName || null,
    p_notes: notes || null,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("insuficiente")) {
      return { error: "No hay stock suficiente para uno de los productos." };
    }
    if (msg.includes("no autorizado")) {
      return { error: "No autorizado." };
    }
    if (msg.includes("ticket")) {
      return { error: "Agrega productos al ticket." };
    }
    return { error: `No se pudo cobrar: ${error.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/productos");
  revalidatePath("/");

  return { orderNumber: orderNumber as string };
}