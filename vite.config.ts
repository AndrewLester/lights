import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: "build",
    },
    base: process.env.VITE_BASE_URL || undefined,
    define: {
        "import.meta.vitest": undefined,
    },
    test: {
        includeSource: ["src/**/*.{js,ts}"],
    },
});
