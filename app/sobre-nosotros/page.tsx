export default function AboutPage() {
  return (
    <div className="min-h-screen bg-reny-cream py-12 px-4">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-4xl font-caveat text-reny-purple-dark">
          Sobre Nosotros
        </h1>
        <p className="text-lg text-gray-700">
          En <strong>Velas Reny</strong> creamos velas artesanales que iluminan
          momentos inolvidables. Cada pieza está hecha a mano con cera de soya
          natural y esencias cuidadosamente seleccionadas para transmitir
          calidez y armonía. Desde celebraciones especiales hasta el simple
          placer de aromatizar tu hogar, tenemos la vela perfecta para ti.
        </p>
        <img
          src="/about-image.jpg"
          alt="Taller de velas"
          className="rounded-2xl shadow-lg mx-auto"
        />
        <p className="italic text-reny-pink-dark font-caveat text-xl">
          “Déjate envolver por la luz y el aroma de Reny”
        </p>
      </div>
    </div>
  );
}