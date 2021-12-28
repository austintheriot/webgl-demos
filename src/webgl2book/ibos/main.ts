import {
  createProgram, createShader, err, resizeCanvasToDisplaySize,
} from "../../utils";
import fragmentShaderSource from './fragment.glsl?raw'
import vertexShaderSource from './vertex.glsl?raw'

// webgl state
let gl: WebGL2RenderingContext;
let program: WebGLProgram;
let vertexBuffer: WebGLBuffer | null;
let indexBuffer: WebGLBuffer | null;
let positionALocation: number;
let vertexArray: number[];
let indexArray: number[];


const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const messageElement = document.querySelector('#message') as HTMLParagraphElement;

const main = async () => {
  gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
  if (!gl) throw err('WebGL not supported', { gl });

  try {
    const renderVertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const renderFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    program = createProgram(gl, renderVertexShader, renderFragmentShader);
  } catch (e) {
    console.error(e);
    messageElement.textContent = `Error occurred: ${e}`;
  }

  positionALocation = gl.getAttribLocation(program, 'a_position');

  // initialize buffers
  vertexArray = [-0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5,]
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  indexArray = [0, 1, 2, 0, 2, 3];
  indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  messageElement.remove();

  render();
}

/** Draw to canvas */
const render = () => {
  gl.useProgram(program);

  resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // enable vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionALocation, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionALocation);

  // use indices to get vertex data rather than pulling directly from buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // render
  gl.drawElements(gl.TRIANGLES, indexArray.length, gl.UNSIGNED_SHORT, 0);

  // clean up
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

main();