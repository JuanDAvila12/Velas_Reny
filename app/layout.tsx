import { Caveat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Velas Reni | Velas artesanales",
  description:
    "Catálogo de velas artesanales de cera de soya natural para iluminar tus momentos especiales.",
};

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${caveat.variable} font-sans`}>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}