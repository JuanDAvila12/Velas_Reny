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
