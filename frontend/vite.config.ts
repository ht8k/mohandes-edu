import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// `BASE_PATH` is set by the GitHub Pages workflow to "/<repo>/" so assets and
// router URLs resolve correctly under https://<user>.github.io/<repo>/.
// Defaults to "/" for local dev and any deploy that serves from the domain root.
const basePath = process.env.BASE_PATH ?? "/"

export default defineConfig({
  base: basePath,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

