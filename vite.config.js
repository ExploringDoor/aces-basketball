import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { prerender } from './scripts/prerender.mjs'

// After every build, write one HTML file per page (own title and link
// preview), plus 404.html, sitemap.xml and robots.txt. See scripts/prerender.mjs.
const pagesPlugin = () => ({
  name: 'aces-prerender-pages',
  apply: 'build',
  closeBundle() {
    const r = prerender()
    console.log(`prerender: ${r.pages} page files, ${r.sitemap} sitemap entries`)
  },
})

export default defineConfig({
  plugins: [react(), pagesPlugin()],
})
