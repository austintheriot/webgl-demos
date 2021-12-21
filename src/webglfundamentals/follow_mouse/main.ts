import { createProgram, createShader, degreesToRadians, err, matrix4x4, radiansToDegrees, resizeCanvasToDisplaySize } from "../utils";
import { letter_f_3d_colors, letter_f_3d_vertices } from "./data";

const NUM_OF_FS = 6;
const F_RADIUS = 0.5;

let scaleX = 1;
let scaleY = 1;
let scaleZ = 1;

let rotateX = degreesToRadians(180);
let rotateY = degreesToRadians(0);
let rotateZ = degreesToRadians(0);

let translateX = 0;
let translateY = 0;
let translateZ = 2;

let originX = 0;
let originY = 0;
let originZ = 0;

let fieldOfViewRadians = degreesToRadians(60);
let zNear = 0.1;
let zFar = 2000;

let moveCameraX = 0;
let moveCameraY = 0.25;
let moveCameraZ = 5;

let rotateCameraXRadians = 0;
let rotateCameraYRadians = 0;
let rotateCameraZRadians = 0;

let lookAtX = 0;
let lookAtY = 0;
let lookAtZ = 0;

let upX = 0;
let upY = 1;
let upZ = 0;



let canvas: HTMLCanvasElement;
let gl: WebGLRenderingContext;
let matrixUniformLocation: WebGLUniformLocation;
let projectionMatrix = matrix4x4.createIdentityMatrix();

const main = async () => {
  initInputs();

  canvas = document.querySelector('canvas') as HTMLCanvasElement;
  if (!canvas) throw err('canvas not found', { canvas });
  gl = canvas.getContext('webgl') as WebGLRenderingContext;
  if (!gl) throw err('WebGL not supported', { gl });

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
  updateProjectionMatrix();

  // RENDER //////////////////////////////////////////////////////////////////
  render();
}


/** Update transformation matrix with new transformation state */
const updateProjectionMatrix = () => {
  projectionMatrix = matrix4x4.createPerspectiveMatrix(fieldOfViewRadians, gl.canvas.clientWidth / gl.canvas.clientHeight, zNear, zFar);
  projectionMatrix = matrix4x4.translate(projectionMatrix, translateX, translateY, translateZ);
  projectionMatrix = matrix4x4.rotateX(projectionMatrix, rotateX);
  projectionMatrix = matrix4x4.rotateY(projectionMatrix, rotateY);
  projectionMatrix = matrix4x4.rotateZ(projectionMatrix, rotateZ);
  projectionMatrix = matrix4x4.scale(projectionMatrix, scaleX, scaleY, scaleZ); // apply specified scale transformation
  projectionMatrix = matrix4x4.translate(projectionMatrix, originX, originY, originZ); // move origin for object
}

/** Draw to canvas */
const render = () => {
  resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.CULL_FACE); // do not draw faces that are facing "backwards"
  gl.enable(gl.DEPTH_TEST); // draw closest pixels over farthest pixels

  let cameraMatrix = matrix4x4.createIdentityMatrix();
  cameraMatrix = matrix4x4.translate(cameraMatrix, -moveCameraX, -moveCameraY, -moveCameraZ);
  cameraMatrix = matrix4x4.rotateX(cameraMatrix, rotateCameraXRadians);
  cameraMatrix = matrix4x4.rotateY(cameraMatrix, rotateCameraYRadians);
  cameraMatrix = matrix4x4.rotateZ(cameraMatrix, rotateCameraZRadians);
  // extract camera position out of camera matrix
  // const cameraPosition: Vec3 = [cameraMatrix[12], cameraMatrix[13], cameraMatrix[14]];
  // cameraMatrix = matrix4x4.createLookAtMatrix(cameraPosition, [lookAtX, lookAtY, lookAtZ], [upX, upY, upZ]);

  // get the view matrix (how to move the world so that the camera is positioned correctly in space)
  // this is the inverse of the camera matrix, because we want to move the world and not the camera
  const viewMatrix = matrix4x4.inverse(cameraMatrix);

  const viewProjectionMatrix = matrix4x4.multiply(projectionMatrix, viewMatrix);


  // draw all fs
  for (let i = 0; i < NUM_OF_FS; i++) {
    const rotationPercentage = i / NUM_OF_FS;
    const rotation = rotationPercentage * Math.PI * 2;
    const x = Math.cos(rotation) * F_RADIUS;
    const z = Math.sin(rotation) * F_RADIUS;
    const fMatrix = matrix4x4.translate(viewProjectionMatrix, x, 0, z);
    gl.uniformMatrix4fv(matrixUniformLocation, false, fMatrix);

    // draw
    const primitiveType = gl.TRIANGLES; // draws a triangle after shader is run every 3 times
    const offset = 0;
    const count = letter_f_3d_vertices.length / 3;
    gl.drawArrays(primitiveType, offset, count);
  }
}

/** Create UI and attach event listeners to update global variables */
const initInputs = () => {
  // SET UP UI //////////////////////////////////////////////////////////////////////
  window.addEventListener('resize', () => {
    updateProjectionMatrix();
    render();
  });

  // move camera rotation with mouse
  window.addEventListener('mousemove', (e) => {
    const SENSITIVITY = 2;
    const { width, height } = canvas.getBoundingClientRect();
    // -0.5 -> 0.5 radians
    const percentX = e.clientX / width - 0.5;
    const percentY = e.clientY / height - 0.5;
    const radiansX = percentX * Math.PI;
    const radiansY = percentY * Math.PI;
    rotateCameraYRadians = radiansX * SENSITIVITY;
    rotateCameraXRadians = -radiansY * SENSITIVITY;
    updateProjectionMatrix();
    render();
  })

  // move camera position with wasd
  window.addEventListener('keydown', (e) => {
    let updated = false;
    switch (e.key) {
      case 'w':
        moveCameraZ -= 0.1;
        updated = true;
        break;
      case 'a':
        moveCameraX += 0.1;
        updated = true;
        break;
      case 's':
        moveCameraZ += 0.1;
        updated = true;
        break;
      case 'd':
        moveCameraX -= 0.1;
        updated = true;
        break;
      default:
        break;
    }
    if (updated) {
      updateProjectionMatrix();
      render();
    }
  })

  const scaleXInput = document.querySelector('#scaleX') as HTMLInputElement;
  scaleXInput.value = scaleX.toString();
  scaleXInput.addEventListener('input', (e: Event) => {
    scaleX = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
  const scaleYInput = document.querySelector('#scaleY') as HTMLInputElement;
  scaleYInput.value = scaleY.toString();
  scaleYInput.addEventListener('input', (e: Event) => {
    scaleY = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
  const scaleZInput = document.querySelector('#scaleZ') as HTMLInputElement;
  scaleZInput.value = scaleZ.toString();
  scaleZInput.addEventListener('input', (e: Event) => {
    scaleZ = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
  const translateXInput = document.querySelector('#translateX') as HTMLInputElement;
  translateXInput.value = translateX.toString();
  translateXInput.addEventListener('input', (e: Event) => {
    translateX = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
  const translateYInput = document.querySelector('#translateY') as HTMLInputElement;
  translateYInput.value = translateY.toString();
  translateYInput.addEventListener('input', (e: Event) => {
    translateY = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
  const translateZInput = document.querySelector('#translateZ') as HTMLInputElement;
  translateZInput.value = translateZ.toString();
  translateZInput.addEventListener('input', (e: Event) => {
    translateZ = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
  const rotateXInput = document.querySelector('#rotateX') as HTMLInputElement;
  rotateXInput.value = radiansToDegrees(rotateX).toString();
  rotateXInput.addEventListener('input', (e: Event) => {
    rotateX = degreesToRadians((e.target as HTMLInputElement).valueAsNumber);
    updateProjectionMatrix();
    render();
  });
  const rotateYInput = document.querySelector('#rotateY') as HTMLInputElement;
  rotateYInput.value = radiansToDegrees(rotateY).toString();
  rotateYInput.addEventListener('input', (e: Event) => {
    rotateY = degreesToRadians((e.target as HTMLInputElement).valueAsNumber);
    updateProjectionMatrix();
    render();
  });
  const rotateZInput = document.querySelector('#rotateZ') as HTMLInputElement;
  rotateZInput.value = radiansToDegrees(rotateZ).toString();
  rotateZInput.addEventListener('input', (e: Event) => {
    rotateZ = degreesToRadians((e.target as HTMLInputElement).valueAsNumber);
    updateProjectionMatrix();
    render();
  });
  const originXInput = document.querySelector('#originX') as HTMLInputElement;
  originXInput.value = originX.toString();
  originXInput.addEventListener('input', (e: Event) => {
    originX = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
  const originYInput = document.querySelector('#originY') as HTMLInputElement;
  originYInput.value = originY.toString();
  originYInput.addEventListener('input', (e: Event) => {
    originY = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
  const originZInput = document.querySelector('#originZ') as HTMLInputElement;
  originZInput.value = originZ.toString();
  originZInput.addEventListener('input', (e: Event) => {
    originZ = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
  const zNearInput = document.querySelector('#zNear') as HTMLInputElement;
  zNearInput.value = zNear.toString();
  zNearInput.addEventListener('input', (e: Event) => {
    zNear = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
  const zFarInput = document.querySelector('#zFar') as HTMLInputElement;
  zFarInput.value = zFar.toString();
  zFarInput.addEventListener('input', (e: Event) => {
    zFar = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
  const fieldOfViewInput = document.querySelector('#fieldOfView') as HTMLInputElement;
  fieldOfViewInput.value = radiansToDegrees(fieldOfViewRadians).toString();
  fieldOfViewInput.addEventListener('input', (e: Event) => {
    fieldOfViewRadians = degreesToRadians((e.target as HTMLInputElement).valueAsNumber);
    updateProjectionMatrix();
    render();
  });
  const moveCameraXInput = document.querySelector('#moveCameraX') as HTMLInputElement;
  moveCameraXInput.value = moveCameraX.toString();
  moveCameraXInput.addEventListener('input', (e: Event) => {
    moveCameraX = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
  const moveCameraYInput = document.querySelector('#moveCameraY') as HTMLInputElement;
  moveCameraYInput.value = moveCameraY.toString();
  moveCameraYInput.addEventListener('input', (e: Event) => {
    moveCameraY = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
  const moveCameraZInput = document.querySelector('#moveCameraZ') as HTMLInputElement;
  moveCameraZInput.value = moveCameraZ.toString();
  moveCameraZInput.addEventListener('input', (e: Event) => {
    moveCameraZ = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
  const rotateCameraXInput = document.querySelector('#rotateCameraX') as HTMLInputElement;
  rotateCameraXInput.value = radiansToDegrees(rotateCameraXRadians).toString();
  rotateCameraXInput.addEventListener('input', (e: Event) => {
    rotateCameraXRadians = degreesToRadians((e.target as HTMLInputElement).valueAsNumber);
    updateProjectionMatrix();
    render();
  });
  const rotateCameraYInput = document.querySelector('#rotateCameraY') as HTMLInputElement;
  rotateCameraYInput.value = radiansToDegrees(rotateCameraYRadians).toString();
  rotateCameraYInput.addEventListener('input', (e: Event) => {
    rotateCameraYRadians = degreesToRadians((e.target as HTMLInputElement).valueAsNumber);
    updateProjectionMatrix();
    render();
  });
  const rotateCameraZInput = document.querySelector('#rotateCameraZ') as HTMLInputElement;
  rotateCameraZInput.value = radiansToDegrees(rotateCameraZRadians).toString();
  rotateCameraZInput.addEventListener('input', (e: Event) => {
    rotateCameraZRadians = degreesToRadians((e.target as HTMLInputElement).valueAsNumber);
    updateProjectionMatrix();
    render();
  });
  const lookAtXInput = document.querySelector('#lookAtX') as HTMLInputElement;
  lookAtXInput.value = lookAtX.toString();
  lookAtXInput.addEventListener('input', (e: Event) => {
    lookAtX = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
  const lookAtYInput = document.querySelector('#lookAtY') as HTMLInputElement;
  lookAtYInput.value = lookAtY.toString();
  lookAtYInput.addEventListener('input', (e: Event) => {
    lookAtY = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
  const lookAtZInput = document.querySelector('#lookAtZ') as HTMLInputElement;
  lookAtZInput.value = lookAtZ.toString();
  lookAtZInput.addEventListener('input', (e: Event) => {
    lookAtZ = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
  const upXInput = document.querySelector('#upX') as HTMLInputElement;
  upXInput.value = upX.toString();
  upXInput.addEventListener('input', (e: Event) => {
    upX = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
  const upYInput = document.querySelector('#upY') as HTMLInputElement;
  upYInput.value = upY.toString();
  upYInput.addEventListener('input', (e: Event) => {
    upY = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
  const upZInput = document.querySelector('#upZ') as HTMLInputElement;
  upZInput.value = upZ.toString();
  upZInput.addEventListener('input', (e: Event) => {
    upZ = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
}


main();