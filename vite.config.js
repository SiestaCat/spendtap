import { defineConfig } from 'vite'
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true })
  const entries = readdirSync(src)
  
  for (const entry of entries) {
    const srcPath = join(src, entry)
    const destPath = join(dest, entry)
    
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

export default defineConfig({
  root: '.',
  server: {
    port: 3000,
    open: true,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: '[name].[ext]',
        entryFileNames: '[name].js'
      }
    }
  },
  publicDir: 'assets',
  plugins: [
    {
      name: 'copy-templates',
      closeBundle() {
        // Create assets directory
        mkdirSync('dist/assets', { recursive: true })
        
        // Copy directories to assets folder  
        copyDir('pages', 'dist/assets/pages')
        copyDir('templates', 'dist/assets/templates')
        
        // Copy all JS components from assets/components to dist/assets/components
        const assetsComponents = 'assets/components'
        const destComponents = 'dist/assets/components'
        mkdirSync(destComponents, { recursive: true })
        
        try {
          const entries = readdirSync(assetsComponents)
          for (const entry of entries) {
            copyFileSync(join(assetsComponents, entry), join(destComponents, entry))
          }
        } catch (err) {
          console.warn('Could not copy assets/components:', err.message)
        }
        
        // Move additional files to assets
        const additionalFiles = ['style.css', 'main.js', 'pages.js', 'template-system.js']
        additionalFiles.forEach(file => {
          try {
            if (readdirSync('dist').includes(file)) {
              copyFileSync(`dist/${file}`, `dist/assets/${file}`)
            }
          } catch (err) {
            console.warn(`Could not move ${file} to assets:`, err.message)
          }
        })
        
        // Copy lang directory to assets
        copyDir('dist/lang', 'dist/assets/lang')
        
        // Copy remaining directories to root (for backward compatibility)
        copyDir('pages', 'dist/pages')
        copyDir('components', 'dist/components')
        copyDir('templates', 'dist/templates')
      }
    }
  ]
})