import { createProgram, createShader, err, matrix3x3, resizeCanvasToDisplaySize } from "../utils";

let scaleX = 1;
let scaleY = 1;
let rotate = 0;
let translateX = 0;
let translateY = 0;
let originX = 0;
let originY = 0;
let canvas: HTMLCanvasElement;
let gl: WebGLRenderingContext;
let matrixUniformLocation: WebGLUniformLocation;

const main = async () => {
  canvas = document.querySelector('canvas') as HTMLCanvasElement;
  if (!canvas) throw err('canvas not found', { canvas });
  gl = canvas.getContext('webgl') as WebGLRenderingContext;
  if (!gl) throw err('WebGL not supported', { gl });

  const WIDTH = 1800;
  const HEIGHT = 1800;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const [vertexShaderSource, fragmentShaderSource] = await Promise.all([
    fetch('./vertex.glsl'),
    fetch('./fragment.glsl'),
  ]).then(([vertex, fragment]) => Promise.all([
    vertex.text(),
    fragment.text()
  ]));

  // create shaders from source code & link to program
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = createProgram(gl, vertexShader, fragmentShader);
  gl.useProgram(program);

  // look up where the vertex data needs to go
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
  matrixUniformLocation = gl.getUniformLocation(program, 'u_matrix') as WebGLUniformLocation;
  const colorUniformLocation = gl.getUniformLocation(program, 'u_color');

  // VERTEX POSITION BUFFER //////////////////////////////////////////////////////////////////
  // Create a buffer and put three 2d clip space points in it
  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) throw err('error creating position buffer', { positionBuffer });
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionAttributeLocation);
  const size = 2;          // 2 components per iteration - get first 2 values from buffer, then next 2, etc.
  const type = gl.FLOAT;   // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  const positionBufferOffset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, positionBufferOffset)
  loadVertexPositionsIntoBuffer(gl);

  // SET UNIFORMS //////////////////////////////////////////////////////////////////
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform4f(colorUniformLocation, 1, 0, 0, 1);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setTransformationMatrix();

  initUI();

  render(gl, canvas);
}

/** Create UI and attach event listeners to update global variables */
const initUI = () => {
  // SET UP UI //////////////////////////////////////////////////////////////////////
  window.addEventListener('resize', () => render(gl, canvas));
  const scaleXInput = document.querySelector('#scale-x') as HTMLInputElement;
  scaleXInput.value = scaleX.toString();
  scaleXInput.addEventListener('input', (e: Event) => {
    scaleX = (e.target as HTMLInputElement).valueAsNumber;
    setTransformationMatrix();
    render(gl, canvas);
  });
  const scaleYInput = document.querySelector('#scale-y') as HTMLInputElement;
  scaleYInput.value = scaleY.toString();
  scaleYInput.addEventListener('input', (e: Event) => {
    scaleY = (e.target as HTMLInputElement).valueAsNumber;
    setTransformationMatrix();
    render(gl, canvas);
  });
  const translateXInput = document.querySelector('#translate-x') as HTMLInputElement;
  translateXInput.value = translateX.toString();
  translateXInput.addEventListener('input', (e: Event) => {
    translateX = (e.target as HTMLInputElement).valueAsNumber;
    setTransformationMatrix();
    render(gl, canvas);
  });
  const translateYInput = document.querySelector('#translate-y') as HTMLInputElement;
  translateYInput.value = translateY.toString();
  translateYInput.addEventListener('input', (e: Event) => {
    translateY = (e.target as HTMLInputElement).valueAsNumber;
    setTransformationMatrix();
    render(gl, canvas);
  });
  const rotateInput = document.querySelector('#rotate') as HTMLInputElement;
  rotateInput.value = rotate.toString();
  rotateInput.addEventListener('input', (e: Event) => {
    rotate = (e.target as HTMLInputElement).valueAsNumber;
    setTransformationMatrix();
    render(gl, canvas);
  });
  const originXInput = document.querySelector('#origin-x') as HTMLInputElement;
  originXInput.value = originX.toString();
  originXInput.addEventListener('input', (e: Event) => {
    originX = (e.target as HTMLInputElement).valueAsNumber;
    setTransformationMatrix();
    render(gl, canvas);
  });
  const originYInput = document.querySelector('#origin-y') as HTMLInputElement;
  originYInput.value = originY.toString();
  originYInput.addEventListener('input', (e: Event) => {
    originY = (e.target as HTMLInputElement).valueAsNumber;
    setTransformationMatrix();
    render(gl, canvas);
  });
}

/** Load vertices into vertex position buffer */
const loadVertexPositionsIntoBuffer = (gl: WebGLRenderingContext) => {
  // copy javascript data into WebGL buffer
  // shape of an "F"
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    // left column
    0, 0,
    0.1, 0,
    0, 0.5,
    0, 0.5,
    0.1, 0,
    0.1, 0.5,

    // top rung
    0.1, 0,
    0.33, 0,
    0.1, 0.1,
    0.1, 0.1,
    0.33, 0,
    0.33, 0.1,

    // middle rung
    0.1, 0.2,
    0.25, 0.2,
    0.1, 0.3,
    0.1, 0.3,
    0.25, 0.2,
    0.25, 0.3,
  ]), gl.STATIC_DRAW);
}

/** Update transformation matrix with new transformation state */
const setTransformationMatrix = () => {
  // create updated transformation matrix
  let matrix = matrix3x3.createIdentityMatrix();
  matrix = matrix3x3.translate(matrix, translateX, translateY);
  matrix = matrix3x3.rotate(matrix, rotate);
  matrix = matrix3x3.scale(matrix, 1, -1); // flip y
  matrix = matrix3x3.scale(matrix, scaleX, scaleY);
  matrix = matrix3x3.translate(matrix, originX, originY);
  gl.uniformMatrix3fv(matrixUniformLocation, false, matrix);
}

/** Draw to canvas */
const render = (gl: WebGLRenderingContext, canvas: HTMLCanvasElement) => {
  resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // draw
  const primitiveType = gl.TRIANGLES; // draws a triangle after shader is run every 3 times
  const offset = 0;
  const count = 18; // 18 / 3 vertices = 6 triangles to draw
  gl.drawArrays(primitiveType, offset, count);
}

main();