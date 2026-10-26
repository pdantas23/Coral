import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "client", "src") },
  },
  test: {
    include: ["client/src/**/*.test.ts", "scripts/**/*.test.ts", "server/**/*.test.ts"],
    environment: "node",
  },
});
