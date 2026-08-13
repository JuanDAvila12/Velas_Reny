import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";

export default async function ProductosPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(name)");

  return (
    <div className="min-h-screen py-12 px-4">
      <h1 className="text-4xl font-caveat text-reny-purple-dark text-center mb-8">
        Nuestras velas
      </h1>
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
