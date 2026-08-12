import Link from "next/link";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  image_url: string;
  category?: { name: string };
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/productos/${product.slug}`}>
      <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition p-4">
        <img
          src={product.image_url || "/placeholder-vela.jpg"}
          alt={product.name}
          className="w-full h-48 object-cover rounded-xl"
        />
        <h3 className="font-caveat text-2xl text-reny-purple-dark mt-2">
          {product.name}
        </h3>
        <p className="text-reny-pink-dark font-bold">${product.price}</p>
      </div>
    </Link>
  );
}