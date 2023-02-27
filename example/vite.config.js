import DepsCache from 'vite-plugin-deps-cache'

function AddDepPlugin() {
  return {
    name: 'add-dep-plugin',
    transform(code, id) {
      if (id.includes('counter.js'))
        return `import upperCase from 'lodash/upperCase'\n${code}`
    },

  }
}

export default {
  plugins: [
    DepsCache(),
    AddDepPlugin(),
  ],
}
