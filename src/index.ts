import { existsSync } from 'node:fs'
import fse from 'fs-extra'
import type { Plugin, ViteDevServer } from 'vite'
import chokidar from 'chokidar'

const cacheDir = './node_modules/.vite'
const metadataPath = `${cacheDir}/deps/_metadata.json`

interface Options {
  /**
   * Milliseconds to wait before writing to package.json.
   *
   * @default 2000
   */
  delay?: number

  /**
   * Specify field's name where dependencies are cached in package.json
   *
   * @default 'vite-deps-cache'
   */
  field?: string
}

export default function VitePluginDepsCache({ delay = 2000, field = 'vite-deps-cache' }: Options = {}): Plugin {
  let includedCache: string[]
  let pkgJson: Record<string, any>
  let server: ViteDevServer

  async function handleDeps() {
    if (!existsSync(metadataPath))
      return

    const metadataJson = await fse.readJSON(metadataPath, 'utf-8')
    pkgJson[field] = [...pkgJson[field], ...Object.keys(metadataJson.optimized).filter(dep => !includedCache.includes(dep))]

    setTimeout(() => {
      if (server)
        server.watcher.unwatch('./package.json')
      fse.writeJSON('./package.json', pkgJson, { spaces: 2 })
      if (server)
        server.watcher.add('./package.json')
    }, delay)
  }

  return {
    name: 'vite-plugin-deps-cache',

    apply: 'serve',

    async config(config) {
      pkgJson = await fse.readJSON('./package.json', 'utf-8')
      config.optimizeDeps = {
        ...config.optimizeDeps,
        include: [
          ...(config.optimizeDeps?.include ?? []),
          ...(pkgJson[field] ??= []),
        ],
      }
    },

    configResolved(config) {
      includedCache = config.optimizeDeps.include ?? []

      const watcher = chokidar.watch(cacheDir, {
        cwd: config.root,
      })

      const timer = setInterval(() => {
        if (existsSync(cacheDir)) {
          watcher.on('change', (path) => {
            if (path.endsWith('_metadata.json'))
              handleDeps()
          })
          clearInterval(timer)
          handleDeps()
        }
      }, 1000)
    },

    configureServer(_server) {
      server = _server
    },
  }
}
