export default function AboutPage() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="glass mx-auto max-w-3xl animate-fade-up space-y-8 rounded-2xl p-8 text-center shadow-xl">
        <h1 className="text-4xl font-caveat text-reni-purple-dark">
          Sobre Nosotros
        </h1>
        <p className="text-lg text-gray-700">
          En <strong>Velas Reni</strong> creamos velas artesanales que iluminan
          momentos inolvidables. Cada pieza está hecha a mano con cera de soya
          natural y esencias cuidadosamente seleccionadas para transmitir
          calidez y armonía. Desde celebraciones especiales hasta el simple
          placer de aromatizar tu hogar, tenemos la vela perfecta para ti.
        </p>
        <img
          src="/about-image.jpg"
          alt="Taller de velas"
          className="mx-auto rounded-2xl shadow-lg"
        />
        <p className="text-xl font-caveat italic text-reni-pink-dark">
          “Déjate envolver por la luz y el aroma de Reni”
        </p>
      </div>
    </div>
  );
}
