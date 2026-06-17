import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  plugins: [],
  tanstackStart: {
    server: {
      entry: "server",
    },
  },
  optimizeDeps: {
    exclude: ["@react-three/drei", "@react-three/fiber", "three"],
  },
});
