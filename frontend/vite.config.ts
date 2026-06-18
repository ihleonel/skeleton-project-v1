import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: "all",

    hmr: {
      clientPort: 8081,    // puerto que ve el browser (el de Nginx)
      path: "/vite-hmr",   // ruta configurada en nginx/conf.d/default.conf
    },

    proxy: {
      "/api": {
        target: "http://backend:8000",
        changeOrigin: true,
      },
    },

    watch: {
      usePolling: true,
      interval: 300,
    },
  },
});
