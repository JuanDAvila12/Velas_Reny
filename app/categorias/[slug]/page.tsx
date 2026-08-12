import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!category) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(name)")
    .eq("category_id", category.id);

  return (
    <div className="min-h-screen bg-reny-cream py-12 px-4">
      <h1 className="text-4xl font-caveat text-reny-purple-dark text-center mb-8">
        {category.name}
      </h1>
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}