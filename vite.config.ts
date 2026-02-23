import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cpSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

function copyPublicExcludingLocked() {
  return {
    name: 'copy-public-excluding-locked',
    closeBundle() {
      const publicDir = join(__dirname, 'public')
      const outDir = join(__dirname, 'dist')
      try {
        const entries = readdirSync(publicDir)
        for (const entry of entries) {
          if (entry === 'image copy.png') continue
          const src = join(publicDir, entry)
          const dest = join(outDir, entry)
          try {
            const stat = statSync(src)
            if (stat.isDirectory()) {
              cpSync(src, dest, { recursive: true })
            } else {
              cpSync(src, dest)
            }
          } catch {
            // skip locked files
          }
        }
      } catch {
        // skip if public dir issue
      }
    }
  }
}

export default defineConfig({
  plugins: [react(), copyPublicExcludingLocked()],
  build: {
    copyPublicDir: false,
  },
})
