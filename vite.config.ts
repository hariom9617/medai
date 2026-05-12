import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    hmr: {
      overlay: false,
    },
    // Allow ngrok host
    allowedHosts: mode === "development" ? [
      'latonya-unexplorable-amphitheatrically.ngrok-free.dev'
    ] : [],
    // Development proxy configuration for ngrok
    proxy: mode === "development" ? {
      '/api': {
        target: 'https://latonya-unexplorable-amphitheatrically.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    } : undefined,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
