import Link from "next/link";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/productos/${product.slug}`} className="group">
      <div className="overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
        <img
          src={product.image_url || "/placeholder-vela.jpg"}
          alt={product.name}
          loading="lazy"
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="p-4">
          <h3 className="font-caveat text-2xl text-reny-purple-dark">
            {product.name}
          </h3>
          {product.aroma && (
            <p className="mt-1 text-xs text-gray-500">Aroma: {product.aroma}</p>
          )}
          <div className="mt-2 flex items-center justify-between">
            <p className="font-bold text-reny-pink-dark">
              ${product.price ?? "—"}
            </p>
            {product.category && (
              <span className="rounded-full bg-reny-green px-2 py-0.5 text-xs text-white">
                {product.category.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
