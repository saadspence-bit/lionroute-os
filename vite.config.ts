import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The released application stays root-relative locally. An explicit, reviewed
// Pages build is the ONLY mode that serves the public repository subpath.
const isPagesBuild = process.env.LIONROUTE_PAGES_BUILD === "1";
if (process.env.LIONROUTE_PAGES_BUILD && !isPagesBuild) {
  throw new Error("Unsupported LIONROUTE_PAGES_BUILD value");
}

export default defineConfig({
  base: isPagesBuild ? "/lionroute-os/" : "/",
  plugins: [react(), tailwindcss()],
  server: {
    host: "127.0.0.1",
    port: 4317,
  },
  preview: {
    host: "127.0.0.1",
    port: 4318,
  },
});
