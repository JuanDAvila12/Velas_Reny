import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(name)")
    .eq("slug", slug)
    .single();

  if (!product) notFound();

  return <ProductDetail product={product} />;
}
