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

/** Item del carrito de compras (persistido en localStorage). */
export interface CartItem {
  product: Product;
  quantity: number;
}

/** Estado de un pedido. */
export type OrderStatus = "pending" | "completed" | "cancelled";

/** Origen del pedido: checkout web o punto de venta. */
export type OrderSource = "web" | "pos";

export interface Order {
  id: number;
  order_number: string;
  user_id: string | null;
  status: OrderStatus;
  source: OrderSource;
  total: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

/** Producto ligero usado por el punto de venta. */
export interface PosProduct {
  id: number;
  name: string;
  price: number | null;
  stock: number;
}
