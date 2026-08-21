import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta personalizada
        "reni-purple": "#D8B4FE", // lila pastel
        "reni-purple-dark": "#A78BFA",
        "reni-pink": "#F9A8D4",
        "reni-pink-dark": "#F472B6",
        "reni-green": "#BBF7D0",
        "reni-green-dark": "#86EFAC",
        "reni-cream": "#FFF7ED",
      },
      fontFamily: {
        caveat: ["var(--font-caveat)", "cursive"],
      },
    },
  },
  plugins: [],
};
export default config;