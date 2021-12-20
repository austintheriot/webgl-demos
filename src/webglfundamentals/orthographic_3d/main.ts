import { createProgram, createShader, err, matrix4x4, resizeCanvasToDisplaySize } from "../utils";
import { letter_f_3d_colors, letter_f_3d_vertices } from "./data";

let scaleX = 1;
let scaleY = 1;
let scaleZ = 1;
let rotateX = 0;
let rotateY = 0;
let rotateZ = 0;
let translateX = 0;
let translateY = 0;
let translateZ = 0;
let originX = 0;
let originY = 0;
let originZ = 0;
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
  const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');
  matrixUniformLocation = gl.getUniformLocation(program, 'u_matrix') as WebGLUniformLocation;

  // VERTEX POSITION BUFFER //////////////////////////////////////////////////////////////////
  // Create a buffer and put three 2d clip space points in it
  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) throw err('error creating position buffer', { positionBuffer });
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(letter_f_3d_vertices), gl.STATIC_DRAW);

  // COLOR POSITION BUFFER //////////////////////////////////////////////////////////////////
  // Create a buffer and put three 2d clip space points in it
  const colorBuffer = gl.createBuffer();
  if (!colorBuffer) throw err('error creating position buffer', { colorBuffer });
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.enableVertexAttribArray(colorAttributeLocation);
  gl.vertexAttribPointer(colorAttributeLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0)
  gl.bufferData(gl.ARRAY_BUFFER, new Uint8ClampedArray(letter_f_3d_colors), gl.STATIC_DRAW);

  // SET UNIFORMS //////////////////////////////////////////////////////////////////
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
  const scaleZInput = document.querySelector('#scale-z') as HTMLInputElement;
  scaleZInput.value = scaleZ.toString();
  scaleZInput.addEventListener('input', (e: Event) => {
    scaleZ = (e.target as HTMLInputElement).valueAsNumber;
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
  const translateZInput = document.querySelector('#translate-z') as HTMLInputElement;
  translateZInput.value = translateZ.toString();
  translateZInput.addEventListener('input', (e: Event) => {
    translateZ = (e.target as HTMLInputElement).valueAsNumber;
    setTransformationMatrix();
    render(gl, canvas);
  });
  const rotateXInput = document.querySelector('#rotate-x') as HTMLInputElement;
  rotateXInput.value = rotateX.toString();
  rotateXInput.addEventListener('input', (e: Event) => {
    rotateX = (e.target as HTMLInputElement).valueAsNumber;
    setTransformationMatrix();
    render(gl, canvas);
  });
  const rotateYInput = document.querySelector('#rotate-y') as HTMLInputElement;
  rotateYInput.value = rotateY.toString();
  rotateYInput.addEventListener('input', (e: Event) => {
    rotateY = (e.target as HTMLInputElement).valueAsNumber;
    setTransformationMatrix();
    render(gl, canvas);
  });
  const rotateZInput = document.querySelector('#rotate-z') as HTMLInputElement;
  rotateZInput.value = rotateZ.toString();
  rotateZInput.addEventListener('input', (e: Event) => {
    rotateZ = (e.target as HTMLInputElement).valueAsNumber;
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
  const originZInput = document.querySelector('#origin-z') as HTMLInputElement;
  originZInput.value = originZ.toString();
  originZInput.addEventListener('input', (e: Event) => {
    originZ = (e.target as HTMLInputElement).valueAsNumber;
    setTransformationMatrix();
    render(gl, canvas);
  });
}

/** Update transformation matrix with new transformation state */
const setTransformationMatrix = () => {
  // create updated transformation matrix
  let matrix = matrix4x4.createIdentityMatrix();
  matrix = matrix4x4.translate(matrix, translateX, translateY, translateZ);
  matrix = matrix4x4.rotateX(matrix, rotateX);
  matrix = matrix4x4.rotateY(matrix, rotateY);
  matrix = matrix4x4.rotateZ(matrix, rotateZ);
  matrix = matrix4x4.scale(matrix, 1, -1, 1); // flip y
  matrix = matrix4x4.scale(matrix, scaleX, scaleY, scaleZ); // apply specified scale transformation
  matrix = matrix4x4.translate(matrix, originX, originY, originZ); // move origin for object
  gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
}

/** Draw to canvas */
const render = (gl: WebGLRenderingContext, canvas: HTMLCanvasElement) => {
  resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.enable(gl.CULL_FACE);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // draw
  const primitiveType = gl.TRIANGLES; // draws a triangle after shader is run every 3 times
  const offset = 0;
  const count = letter_f_3d_vertices.length / 3;
  gl.drawArrays(primitiveType, offset, count);
}

main();