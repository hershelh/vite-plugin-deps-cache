# vite-plugin-deps-cache

Cache optimized dependencies continuously.

## Why you need this plugin

Vite has a powerful pre-bundling process that bundle all your dependencies used by your source code that prevent your Vite application from throwing error during runtime due to CommonJs compatibility problem and network congestion(refer to the [docs](https://vitejs.dev/guide/dep-pre-bundling.html) for more information), but it still has its limitation, one is the new dependency handing.

Some plugin(like unplugin-vue-components) introduced new dependencies during runtime that causes Vite server to start pre-bundling again. Once it's done, the server probably will notify the browser to full reload to import the new pre-bundled file, causing the existing states on the page to disappear, and we have to wait for a moment for the new registered dependencies to be pre-bundled, which reduces the DX.

This plugin caches all the new registered dependencies pre-bundled during application run, and injects them before the next server start. That says, it advances the pre-bundling to the cold starting phase, which may reduce startup time but will definitely solve the problem menstioned above.

## Install

```
npm i -D vite-plugin-deps-cache
```

Add this plugin to your `vite.config.ts`:

```ts
import DepsCache from 'vite-plugin-deps-cache'

export default {
  plugins: [
    DepsCache(),
  ]
}
```