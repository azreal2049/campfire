import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'

function saveBlueprintPlugin(): Plugin {
  return {
    name: 'save-blueprint',
    configureServer(server) {
      server.middlewares.use('/__save-blueprint', (request, response) => {
        if (request.method !== 'POST') {
          response.statusCode = 405
          response.setHeader('Allow', 'POST')
          response.end('Method not allowed')
          return
        }
        const chunks: Buffer[] = []
        let size = 0
        request.on('data', (chunk: Buffer) => {
          size += chunk.length
          if (size > 10 * 1024 * 1024) {
            response.statusCode = 413
            response.end('Blueprint payload is too large')
            request.destroy()
            return
          }
          chunks.push(chunk)
        })
        request.on('end', () => {
          try {
            const payload = Buffer.concat(chunks).toString('utf8')
            JSON.parse(payload)
            writeFileSync(resolve(server.config.root, 'ui-blueprint.json'), payload, 'utf8')
            response.statusCode = 200
            response.setHeader('Content-Type', 'application/json')
            response.end(JSON.stringify({ saved: true, file: 'ui-blueprint.json' }))
          } catch (error) {
            server.config.logger.error(`Could not save ui-blueprint.json: ${String(error)}`)
            response.statusCode = 400
            response.setHeader('Content-Type', 'application/json')
            response.end(JSON.stringify({ saved: false, error: 'Invalid JSON or unable to write blueprint' }))
          }
        })
        request.on('error', (error) => {
          server.config.logger.error(`Blueprint upload failed: ${error.message}`)
          if (!response.headersSent) response.statusCode = 500
          response.end('Blueprint upload failed')
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), saveBlueprintPlugin()],
})
