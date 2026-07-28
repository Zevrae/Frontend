import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    plugins: [react(), tailwindcss()],
<<<<<<< HEAD
=======

    define: {
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },

>>>>>>> 2ed565c4f89a783c904ebdc4427487708584db7a
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
<<<<<<< HEAD
=======

    server: {
      hmr: process.env.DISABLE_HMR !== "true",
    },
>>>>>>> 2ed565c4f89a783c904ebdc4427487708584db7a
  };
});