import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      // 開発中、/apiへのリクエストをSpring Bootへ転送する。
      // /apiを含むパスは、そのまま転送する。
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
