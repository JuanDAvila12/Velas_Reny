import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta personalizada
        "reny-purple": "#D8B4FE", // lila pastel
        "reny-purple-dark": "#A78BFA",
        "reny-pink": "#F9A8D4",
        "reny-pink-dark": "#F472B6",
        "reny-green": "#BBF7D0",
        "reny-green-dark": "#86EFAC",
        "reny-cream": "#FFF7ED",
      },
      fontFamily: {
        caveat: ["var(--font-caveat)", "cursive"],
      },
    },
  },
  plugins: [],
};
export default config;