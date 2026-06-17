import { defineConfig } from "@lovable.dev/vite-tanstack-config";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [cloudflare({
    viteEnvironment: {
      name: "ssr"
    }
  })],
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