import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import mdx from "@mdx-js/rollup";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [mdx(), tailwindcss(), reactRouter(), cloudflare({
    viteEnvironment: {
      name: "ssr"
    }
  })],
  resolve: {
    tsconfigPaths: true,
  },
});