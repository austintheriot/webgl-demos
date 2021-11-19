const { resolve } = require('path');
const { defineConfig } = require('vite');

module.exports = defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'src/tinyrenderer/lesson1/index.html'),
        nested: resolve(__dirname, 'src/tinyrenderer/lesson2/index.html')
      }
    }
  }
})