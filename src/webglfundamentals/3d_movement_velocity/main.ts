import { crossVec3, normalizeVec3, subtractVec3 } from "../../utils";
import { addVec3, createProgram, createShader, degreesToRadians, err, matrix4x4, multiplyVec3, resizeCanvasToDisplaySize, Vec3 } from "../utils";
import { letter_f_3d_colors, letter_f_3d_vertices } from "./data";

const NUM_OF_FS = 6;
const F_RADIUS = 0.5;

// webgl
let canvas: HTMLCanvasElement;
let gl: WebGLRenderingContext;
let matrixUniformLocation: WebGLUniformLocation;
let viewProjectionMatrix = matrix4x4.createIdentityMatrix();

// view frustum
let fieldOfViewRadians = degreesToRadians(60);
let zNear = 0.1;
let zFar = 100;

// camera
const controlsDownMap = {
  w: false,
  a: false,
  s: false,
  d: false,
};
const LOOK_SENSITIVITY = 120;
const VELOCITY_SENSITIVITY = 0.0005;
const VELOCITY_DAMPING = 0.9;
let pitch = 0;
let yaw = -90; // turn from looking "down" the x axis to looking "up" the z-axis
let cameraVelocity: Vec3 = [0, 0, 0];
let cameraPos: Vec3 = [0, 0.1, 2];
let cameraFront: Vec3 = [0, 0, -1]; // start out "straight ahead"
let cameraUp: Vec3 = [0, 1, 0];

const main = async () => {
  canvas = document.querySelector('canvas') as HTMLCanvasElement;
  if (!canvas) throw err('canvas not found', { canvas });
  gl = canvas.getContext('webgl') as WebGLRenderingContext;
  if (!gl) throw err('WebGL not supported', { gl });

  initInputs();

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
  updateCamera();
  updateMatrix();

  // RENDER //////////////////////////////////////////////////////////////////
  requestAnimationFrame(render);
}

const updatePosition = (dt: number) => {
  cameraPos[0] += cameraVelocity[0] * dt;
  cameraPos[1] += cameraVelocity[1] * dt;
  cameraPos[2] += cameraVelocity[2] * dt;
}

const updateVelocity = () => {
  if (controlsDownMap.w) cameraVelocity = addVec3(cameraVelocity, multiplyVec3(cameraFront, VELOCITY_SENSITIVITY));
  if (controlsDownMap.a) cameraVelocity = subtractVec3(cameraVelocity, multiplyVec3(normalizeVec3(crossVec3(cameraFront, cameraUp)), VELOCITY_SENSITIVITY));
  if (controlsDownMap.s) cameraVelocity = subtractVec3(cameraVelocity, multiplyVec3(cameraFront, VELOCITY_SENSITIVITY));
  if (controlsDownMap.d) cameraVelocity = addVec3(cameraVelocity, multiplyVec3(normalizeVec3(crossVec3(cameraFront, cameraUp)), VELOCITY_SENSITIVITY));

  cameraVelocity[0] *= VELOCITY_DAMPING;
  cameraVelocity[1] *= VELOCITY_DAMPING;
  cameraVelocity[2] *= VELOCITY_DAMPING;
}

const updateCamera = (px = 0, py: number = 0) => {
  yaw += px * LOOK_SENSITIVITY;
  pitch += py * LOOK_SENSITIVITY;

  let newCameraFront: Vec3 = [0, 0, 0];
  newCameraFront[0] = Math.cos(degreesToRadians(yaw)) * Math.cos(degreesToRadians(pitch));
  newCameraFront[1] = Math.sin(degreesToRadians(pitch));
  newCameraFront[2] = Math.sin(degreesToRadians(yaw)) * Math.cos(degreesToRadians(pitch));
  cameraFront = normalizeVec3(newCameraFront);
}

/** Update transformation matrix with new transformation state */
const updateMatrix = () => {
  const projectionMatrix = matrix4x4.createPerspectiveMatrix(fieldOfViewRadians, gl.canvas.clientWidth / gl.canvas.clientHeight, zNear, zFar);
  const lookAtTarget = addVec3(cameraPos, cameraFront);
  const cameraMatrix = matrix4x4.createLookAtMatrix(cameraPos, lookAtTarget, cameraUp);
  const viewMatrix = matrix4x4.inverse(cameraMatrix);
  viewProjectionMatrix = matrix4x4.multiply(projectionMatrix, viewMatrix);
}

/** Draw to canvas */
let prevNow: number | null = null;
const render = (now: number) => {
  if (prevNow === null) prevNow = now;
  const dt = now - prevNow;
  prevNow = now;

  updatePosition(dt);
  updateVelocity();
  updateCamera();
  updateMatrix();

  resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.CULL_FACE); // do not draw faces that are facing "backwards"
  gl.enable(gl.DEPTH_TEST); // draw closest pixels over farthest pixels

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

  requestAnimationFrame(render);
}

/** Create UI and attach event listeners to update global variables */
const initInputs = () => {
  // SET UP UI //////////////////////////////////////////////////////////////////////
  window.addEventListener('resize', () => {
    updateMatrix();
  });

  // keep track of which keys are down -- this allows incrementing 
  // velocity based on multiple keys at once
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'w':
        controlsDownMap.w = true;
        break;
      case 'a':
        controlsDownMap.a = true;
        break;
      case 's':
        controlsDownMap.s = true;
        break;
      case 'd':
        controlsDownMap.d = true;
        break;
      default:
        break;
    }
  })
  window.addEventListener('keyup', (e) => {
    switch (e.key) {
      case 'w':
        controlsDownMap.w = false;
        break;
      case 'a':
        controlsDownMap.a = false;
        break;
      case 's':
        controlsDownMap.s = false;
        break;
      case 'd':
        controlsDownMap.d = false;
        break;
      default:
        break;
    }
  })

  const enableButton = document.querySelector('#enable') as HTMLButtonElement;
  enableButton.addEventListener('click', () => {
    canvas.requestPointerLock();
  });

  // show/hide message
  document.addEventListener('pointerlockchange', () => {
    const backdrop = document.querySelector('#backdrop') as HTMLDivElement;
    if (document.pointerLockElement === canvas) {
      backdrop.classList.add('hide');
    } else {
      backdrop.classList.remove('hide');
    }
  });

  canvas.onmousemove = (e) => {
    const { width, height } = canvas.getBoundingClientRect();
    const px = e.movementX / width;
    const py = -e.movementY / height;
    updateCamera(px, py);
    updateMatrix();
  }
}


main();