import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/manifest.json',
          dest: '.'
        },
        {
          src: 'public/background.js',
          dest: '.'
        },
        {
          src: 'public/content.js',
          dest: '.'
        },
        {
          src: 'public/icon.png',
          dest: '.'
        }
      ]
    })
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: 'index.html'
      }
    }
  },
});
