import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "src/background.js", // source file
          dest: "." // copy directly into dist/
        }
      ]
    })
  ],
  build: {
    outDir: "dist",
  },
});
