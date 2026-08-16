"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/admin";

export type InventoryActionState = {
  error?: string;
  success?: string;
};

type MovementType = "entrada" | "salida" | "ajuste";

const VALID_TYPES: MovementType[] = ["entrada", "salida", "ajuste"];

/**
 * Registra un movimiento de inventario.
 *
 * - Solo administradores (is_admin()).
 * - Valida producto existente, tipo y cantidad en el servidor.
 * - Para salida, además valida stock suficiente (el trigger de BD lo refuerza).
 * - `created_by` se rellena automáticamente con auth.uid() en la base de datos.
 */
export async function registerMovement(
  _prevState: InventoryActionState,
  formData: FormData
): Promise<InventoryActionState> {
  if (!(await isAdmin())) {
    return { error: "No tienes permisos de administrador." };
  }

  const supabase = await createClient();

  const productIdRaw = (formData.get("product_id") as string)?.trim();
  const movementType = (formData.get("movement_type") as string)?.trim();
  const quantityRaw = (formData.get("quantity") as string)?.trim();
  const note = (formData.get("note") as string)?.trim() || null;

  const productId = Number(productIdRaw);
  const quantity = Number(quantityRaw);

  if (!productIdRaw || Number.isNaN(productId)) {
    return { error: "Selecciona un producto." };
  }
  if (!movementType || !VALID_TYPES.includes(movementType as MovementType)) {
    return { error: "Tipo de movimiento no válido." };
  }
  if (!quantityRaw || !Number.isInteger(quantity)) {
    return { error: "La cantidad debe ser un número entero." };
  }
  if (movementType === "entrada" || movementType === "salida") {
    if (quantity <= 0) {
      return { error: "La cantidad debe ser un entero positivo." };
    }
  }
  if (movementType === "ajuste" && quantity < 0) {
    return { error: "El ajuste debe indicar un stock absoluto (0 o mayor)." };
  }

  // El producto debe existir.
  const { data: product } = await supabase
    .from("products")
    .select("id, stock")
    .eq("id", productId)
    .maybeSingle();

  if (!product) {
    return { error: "El producto seleccionado no existe." };
  }

  // Validación amigable de stock para salida (el trigger también la refuerza).
  if (movementType === "salida" && quantity > product.stock) {
    return {
      error: `Stock insuficiente: hay ${product.stock} unidad(es) disponibles.`,
    };
  }

  const { error } = await supabase.from("stock_movements").insert({
    product_id: productId,
    movement_type: movementType as MovementType,
    quantity,
    note,
  });

  if (error) {
    return { error: `Error al registrar el movimiento: ${error.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/productos");
  revalidatePath("/");

  return { success: "Movimiento registrado correctamente." };
}
