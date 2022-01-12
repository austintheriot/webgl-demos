const { resolve } = require('path');
const { defineConfig } = require('vite');

module.exports = defineConfig({
  base: 'https://austintheriot.github.io/webgl-demos/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        strangeAttractors: resolve(__dirname, 'src/demos/strange_attractor/index.html'),
        parametricEquations: resolve(__dirname, 'src/demos/parametric_equations/index.html'),
        cameraWithVelocity: resolve(__dirname, 'src/webglfundamentals/3d_camera_with_velocity/index.html'),
      }
    }
  }
})