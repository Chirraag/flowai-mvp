import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "../shared"),
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "../server/dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
    allowedHosts:
      ["0f1bb795-d559-4b2f-888d-5dd01a5bb780-00-3g69905bg105d.pike.replit.dev"],
    proxy: {
      "/api": {
        target:
          "https://0f1bb795-d559-4b2f-888d-5dd01a5bb780-00-3g69905bg105d.pike.replit.dev:5000",
        changeOrigin: true,
      },
    },
  },
});
