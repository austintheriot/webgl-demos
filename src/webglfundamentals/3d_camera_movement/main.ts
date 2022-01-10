import { crossVec3, normalizeVec3, subtractVec3 } from "../../utils";
import { addVec3, createProgram, createShader, degreesToRadians, err, matrix4x4, multiplyVec3, radiansToDegrees, resizeCanvasToDisplaySize, Vec3 } from "../utils";
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
let translateZ = -5;
let originX = 0;
let originY = 0;
let originZ = 0;
let fieldOfViewRadians = degreesToRadians(60);
let cameraAngleRadians = degreesToRadians(0);
let zNear = 0.1;
let zFar = 2000;
let canvas: HTMLCanvasElement;
let gl: WebGLRenderingContext;
let matrixUniformLocation: WebGLUniformLocation;
let projectionMatrix = matrix4x4.createIdentityMatrix();

let cameraPos: Vec3 = [0, 0, 3];
let cameraFront: Vec3 = [0, 0, -1];
let cameraUp: Vec3 = [0, 1, 3];

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


  const cameraMatrix = matrix4x4.createLookAtMatrix(cameraPos, addVec3(cameraPos, cameraFront), cameraUp);

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

  // move camera position with wasd
  window.addEventListener('keydown', (e) => {
    let updated = false;
    const cameraSpeed = 0.05;
    switch (e.key) {
      case 'w':
        cameraPos = subtractVec3(cameraPos, multiplyVec3(cameraFront, cameraSpeed));
        updated = true;
        break;
      case 's':
        cameraPos = addVec3(cameraPos, multiplyVec3(cameraFront, cameraSpeed));
        updated = true;
        break;
      case 'a':
        cameraPos = subtractVec3(cameraPos, multiplyVec3(normalizeVec3(crossVec3(cameraFront, cameraUp)), cameraSpeed));
        updated = true;
        break;
      case 'd':
        cameraPos = addVec3(cameraPos, multiplyVec3(normalizeVec3(crossVec3(cameraFront, cameraUp)), cameraSpeed));
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
  const cameraAngleInput = document.querySelector('#cameraAngle') as HTMLInputElement;
  cameraAngleInput.value = radiansToDegrees(cameraAngleRadians).toString();
  cameraAngleInput.addEventListener('input', (e: Event) => {
    cameraAngleRadians = degreesToRadians((e.target as HTMLInputElement).valueAsNumber);
    updateProjectionMatrix();
    render();
  });
  const cameraXInput = document.querySelector('#cameraX') as HTMLInputElement;
  cameraXInput.value = cameraPos[0].toString();
  cameraXInput.addEventListener('input', (e: Event) => {
    cameraPos[0] = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
  const cameraYInput = document.querySelector('#cameraY') as HTMLInputElement;
  cameraYInput.value = cameraPos[1].toString();
  cameraYInput.addEventListener('input', (e: Event) => {
    cameraPos[1] = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
  const cameraZInput = document.querySelector('#cameraZ') as HTMLInputElement;
  cameraZInput.value = cameraPos[2].toString();
  cameraZInput.addEventListener('input', (e: Event) => {
    cameraPos[2] = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
    render();
  });
}


main();