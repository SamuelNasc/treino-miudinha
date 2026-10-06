import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Treino Miudinha",
        short_name: "Miudinha",
        description: "O checklist de treino da Miudinha",
        lang: "pt-BR",
        display: "standalone",
        start_url: "/",
        background_color: "#fff5f6",
        theme_color: "#b3122e",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff,woff2,png,svg}"],
        navigateFallback: "index.html",
      },
    }),
  ],
});
