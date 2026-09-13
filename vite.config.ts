import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    plugins: [
      react(),
      tailwindcss(),
      ViteImageOptimizer({
        test: /\.(jpe?g|png|gif|tiff|webp|avif)$/i,
        webp: {
          quality: 82,
          effort: 6,
        },
        png: {
          quality: 82,
          compressionLevel: 8,
        },
        jpeg: {
          quality: 82,
        },
      }),
    ],
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/.test(id)) {
                return 'vendor-react';
              }
              if (/[\\/]node_modules[\\/]motion[\\/]/.test(id)) {
                return 'vendor-motion';
              }
              if (/[\\/]node_modules[\\/]gsap[\\/]/.test(id)) {
                return 'vendor-gsap';
              }
              if (/[\\/]node_modules[\\/]lucide-react[\\/]/.test(id)) {
                return 'vendor-icons';
              }
              if (/[\\/]node_modules[\\/](axios|clsx|tailwind-merge|class-variance-authority)[\\/]/.test(id)) {
                return 'vendor-utils';
              }
              if (/[\\/]node_modules[\\/]@radix-ui[\\/]/.test(id)) {
                return 'vendor-radix';
              }
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});