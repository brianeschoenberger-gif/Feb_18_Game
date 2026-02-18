import { defineConfig } from "vite";

export default defineConfig({
  define: {
    "typeof CANVAS_RENDERER": JSON.stringify(true),
    "typeof WEBGL_RENDERER": JSON.stringify(true)
  },
  server: {
    port: 5173
  }
});
