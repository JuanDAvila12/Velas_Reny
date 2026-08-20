import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(name)")
    .eq("category_id", category.id);

  return (
    <div className="min-h-screen px-4 py-12">
      <h1 className="mb-8 animate-fade-up text-center text-4xl font-caveat text-reny-purple-dark">
        {category.name}
      </h1>
      {products && products.length > 0 ? (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          Aún no hay productos en esta categoría.
        </p>
      )}
    </div>
  );
}
