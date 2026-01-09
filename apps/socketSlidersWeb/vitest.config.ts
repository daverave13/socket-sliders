import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "e2e"],
    coverage: {
      provider: "v8", // or "istanbul"
      reporter: ["text", "json", "html"],
      include: ["app/**/*.{ts,tsx}"], // Test ALL app code
      exclude: [
        "app/routes.ts",
        "app/routes/**", // route components - covered by E2E tests
        "app/root.tsx", // app wrapper - covered by E2E tests
        "app/**/*.test.{ts,tsx}",
        "app/components/ui/**", // shadcn components - tested upstream
        "**/*.config.{ts,js}",
      ],
    },
  },
});
