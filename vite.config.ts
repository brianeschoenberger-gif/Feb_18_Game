import { defineConfig } from "vite";

export default defineConfig({
  base: "/Feb_18_Game/",
  define: {
    "typeof CANVAS_RENDERER": JSON.stringify(true),
    "typeof WEBGL_RENDERER": JSON.stringify(true)
  },
  server: {
    port: 5173
  }
});
