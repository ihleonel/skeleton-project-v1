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
    // HMR WebSocket: el browser conecta a ws://localhost/vite-hmr
    // Nginx hace el upgrade y lo reenvía al contenedor.
    hmr: {
      clientPort: 80,      // puerto que ve el browser (el de Nginx)
      path: "/vite-hmr",   // ruta configurada en nginx/conf.d/default.conf
    },
    // Vite proxies /api hacia Django para evitar CORS en desarrollo
    proxy: {
      "/api": {
        target: "http://backend:8000",
        changeOrigin: true,
      },
    },
  },
});
