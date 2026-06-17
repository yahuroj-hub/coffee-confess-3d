import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  plugins: [],
  tanstackStart: {
    server: {
      entry: "server",
    },
  },
  nitro: {
    preset: "node-server", // Force standalone Node.js server build for production
  },
  optimizeDeps: {
    exclude: ["@react-three/drei", "@react-three/fiber", "three"],
  },
});
