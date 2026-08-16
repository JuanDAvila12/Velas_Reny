export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  stock: number;
  category_id: number | null;
  image_url: string | null;
  images?: string[] | null;
  aroma: string | null;
  color: string | null;
  tamano: string | null;
  intensidad: string | null;
  is_featured: boolean;
  created_at: string;
  category?: { name: string } | null;
}

export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  image_url: string | null;
  is_featured: boolean;
  category?: { name: string } | null;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  is_admin: boolean;
  created_at: string;
}

export type StockMovementType =
  | "entrada"
  | "salida"
  | "ajuste_inicial"
  | "ajuste";

export interface StockMovement {
  id: number;
  product_id: number;
  movement_type: StockMovementType;
  quantity: number;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface InventoryProduct {
  id: number;
  name: string;
  stock: number;
  category?: { name: string } | null;
}

/** Forma serializable que se pasa al componente cliente de inventario. */
export interface MovementRow {
  id: number;
  product_name: string;
  movement_type: StockMovementType;
  quantity: number;
  note: string | null;
  creator_name: string;
  created_at: string;
}
