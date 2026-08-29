import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves this project under a repository subpath
// (https://<user>.github.io/cost-manager-front-end/), not the domain root.
// `vite preview` reports command "serve" (like `vite dev`) with a separate
// isPreview flag, so isPreview must be checked too - otherwise the preview
// server serves at "/" while the already-built dist/index.html references
// assets under the subpath, and every asset request falls through to the
// SPA index.html fallback instead of the real file.
export default defineConfig(({ command, isPreview }) => ({
  base: command === "build" || isPreview ? "/cost-manager-front-end/" : "/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js"
  }
}));
