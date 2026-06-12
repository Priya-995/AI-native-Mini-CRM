import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  preview: {
    allowedHosts: ["ai-native-mini-crm-production-717d.up.railway.app"],
  },
  nitro: {
    preset: "node-server",
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});