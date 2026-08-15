import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

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

  const details = [
    ["Aroma", product.aroma],
    ["Color", product.color],
    ["Tamaño", product.tamano],
    ["Intensidad", product.intensidad],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto grid max-w-4xl gap-8 rounded-2xl bg-white p-8 shadow-xl md:grid-cols-2">
        <img
          src={product.image_url || "/placeholder-vela.jpg"}
          alt={product.name}
          className="h-80 w-full rounded-xl object-cover"
        />
        <div className="space-y-4">
          <h1 className="text-4xl font-caveat text-reny-purple-dark">
            {product.name}
          </h1>
          <p className="text-gray-600">{product.description}</p>
          <p className="text-2xl font-bold text-reny-pink-dark">
            ${product.price ?? "—"}
          </p>
          {product.stock != null && (
            <p
              className={`text-sm ${
                product.stock > 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {product.stock > 0 ? `Disponibles: ${product.stock}` : "Agotado"}
            </p>
          )}
          {product.category && (
            <span className="inline-block rounded-full bg-reny-green px-3 py-1 text-sm text-white">
              {product.category.name}
            </span>
          )}
          {details.length > 0 && (
            <ul className="space-y-1 rounded-xl bg-gray-50 p-4 text-sm">
              {details.map(([label, value]) => (
                <li key={label}>
                  <span className="font-semibold">{label}:</span> {value}
                </li>
              ))}
            </ul>
          )}
          <button
            disabled
            className="mt-4 w-full cursor-not-allowed rounded-lg bg-gray-300 py-3 font-bold text-white"
          >
            Próximamente disponible para compra
          </button>
        </div>
      </div>
    </div>
  );
}
