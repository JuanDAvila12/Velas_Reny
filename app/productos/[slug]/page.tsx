import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(name)")
    .eq("slug", params.slug)
    .single();

  if (!product) notFound();

  return (
    <div className="min-h-screen bg-reny-cream py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 grid md:grid-cols-2 gap-8">
        <img
          src={product.image_url || "/placeholder-vela.jpg"}
          alt={product.name}
          className="w-full h-80 object-cover rounded-xl"
        />
        <div className="space-y-4">
          <h1 className="text-4xl font-caveat text-reny-purple-dark">
            {product.name}
          </h1>
          <p className="text-gray-600">{product.description}</p>
          <p className="text-2xl font-bold text-reny-pink-dark">
            ${product.price}
          </p>
          {product.category && (
            <span className="inline-block bg-reny-green text-white px-3 py-1 rounded-full text-sm">
              {product.category.name}
            </span>
          )}
          <button
            disabled
            className="mt-4 w-full bg-gray-300 text-white py-3 rounded-lg font-bold cursor-not-allowed"
          >
            Próximamente disponible para compra
          </button>
        </div>
      </div>
    </div>
  );
}