const { resolve } = require('path');
const { defineConfig } = require('vite');

module.exports = defineConfig({
  base: 'https://austintheriot.github.io/webgl-demos/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        strangeAttractors: resolve(__dirname, 'src/examples/strange_attractor/index.html'),
      }
    }
  }
})