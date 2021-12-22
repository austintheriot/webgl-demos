import {
  createProgram, createShader, degreesToRadians, err, matrix4x4,
  radiansToDegrees, resizeCanvasToDisplaySize
} from "../utils";

const scaleXInput = document.querySelector('#scaleX') as HTMLInputElement;
const scaleYInput = document.querySelector('#scaleY') as HTMLInputElement;
const scaleZInput = document.querySelector('#scaleZ') as HTMLInputElement;
const translateXInput = document.querySelector('#translateX') as HTMLInputElement;
const translateYInput = document.querySelector('#translateY') as HTMLInputElement;
const translateZInput = document.querySelector('#translateZ') as HTMLInputElement;
const rotateXInput = document.querySelector('#rotateX') as HTMLInputElement;
const rotateYInput = document.querySelector('#rotateY') as HTMLInputElement;
const rotateZInput = document.querySelector('#rotateZ') as HTMLInputElement;
const originXInput = document.querySelector('#originX') as HTMLInputElement;
const originYInput = document.querySelector('#originY') as HTMLInputElement;
const originZInput = document.querySelector('#originZ') as HTMLInputElement;
const zNearInput = document.querySelector('#zNear') as HTMLInputElement;
const zFarInput = document.querySelector('#zFar') as HTMLInputElement;
const rotateCameraXInput = document.querySelector('#rotateCameraX') as HTMLInputElement;
const rotateCameraYInput = document.querySelector('#rotateCameraY') as HTMLInputElement;
const rotateCameraZInput = document.querySelector('#rotateCameraZ') as HTMLInputElement;
const moveCameraXInput = document.querySelector('#moveCameraX') as HTMLInputElement;
const moveCameraYInput = document.querySelector('#moveCameraY') as HTMLInputElement;
const moveCameraZInput = document.querySelector('#moveCameraZ') as HTMLInputElement;

const ROTATE_CAMERA_X_MIN_RADIANS = degreesToRadians(-60);
const ROTATE_CAMERA_X_MAX_RADIANS = degreesToRadians(60);
let rotateCameraX = degreesToRadians(0);
let rotateCameraY = degreesToRadians(0);
let rotateCameraZ = degreesToRadians(0);

let moveCameraX = 0;
let moveCameraY = 0;
let moveCameraZ = 10;

let scaleX = 1;
let scaleY = 1;
let scaleZ = 1;

let rotateX = degreesToRadians(180);
let rotateY = degreesToRadians(0);
let rotateZ = degreesToRadians(0);

let translateX = 0;
let translateY = 0;
let translateZ = -15;

let originX = 0;
let originY = 0;
let originZ = 0;

let cameraAngleRadians = degreesToRadians(60);
let zNear = 0.1;
let zFar = 2000;

let canvas: HTMLCanvasElement;
let gl: WebGLRenderingContext;
let matrixUniformLocation: WebGLUniformLocation;
let projectionMatrix = matrix4x4.createIdentityMatrix();

let prevTouchX: number;
let prevTouchY: number;
let prevDragX: number;
let prevDragY: number;
let mouseDown = false;

// create an array of random points
const NUM_POINTS = 100_000;
const POINT_POSITION_ARRAY = new Array(NUM_POINTS * 3).fill(null).map(() => Math.random() * 2 - 1);
const COLOR_ARRAY = new Array(NUM_POINTS * 3).fill(null).map(() => Math.random() * 2 - 1);

const main = async () => {
  initInputs();

  canvas = document.querySelector('canvas') as HTMLCanvasElement;
  if (!canvas) throw err('canvas not found', { canvas });
  gl = canvas.getContext('webgl2') as WebGLRenderingContext;
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
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(POINT_POSITION_ARRAY), gl.STATIC_DRAW);

  // COLOR POSITION BUFFER //////////////////////////////////////////////////////////////////
  // Create a buffer and put three 2d clip space points in it
  const colorBuffer = gl.createBuffer();
  if (!colorBuffer) throw err('error creating position buffer', { colorBuffer });
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.enableVertexAttribArray(colorAttributeLocation);
  gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(COLOR_ARRAY), gl.STATIC_DRAW);

  // SET UNIFORMS //////////////////////////////////////////////////////////////////
  updateProjectionMatrix();

  // RENDER //////////////////////////////////////////////////////////////////
  render();
}


/** Update transformation matrix with new transformation state */
const updateProjectionMatrix = () => {
  projectionMatrix = matrix4x4.createPerspectiveMatrix(cameraAngleRadians, gl.canvas.clientWidth / gl.canvas.clientHeight, zNear, zFar);
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

  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.enable(gl.BLEND);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  let cameraMatrix = matrix4x4.createIdentityMatrix();
  cameraMatrix = matrix4x4.rotateY(cameraMatrix, rotateCameraY);
  cameraMatrix = matrix4x4.rotateX(cameraMatrix, rotateCameraX);
  cameraMatrix = matrix4x4.rotateZ(cameraMatrix, rotateCameraZ);
  cameraMatrix = matrix4x4.translate(cameraMatrix, moveCameraX, moveCameraY, moveCameraZ);
  // extract camera position out of camera matrix
  // const cameraPosition: Vec3 = [cameraMatrix[12], cameraMatrix[13], cameraMatrix[14]];
  // const up: Vec3 = [0, 1, 0];
  // const lookAt: Vec3 = [0, 0, 0];
  // cameraMatrix = matrix4x4.createLookAtMatrix(cameraPosition, lookAt, up);

  // get the view matrix (how to move the world so that the camera is positioned correctly in space)
  // this is the inverse of the camera matrix, because we want to move the world and not the camera
  const viewMatrix = matrix4x4.inverse(cameraMatrix);

  const viewProjectionMatrix = matrix4x4.multiply(projectionMatrix, viewMatrix);

  gl.uniformMatrix4fv(matrixUniformLocation, false, viewProjectionMatrix);

  gl.drawArrays(gl.POINTS, 0, NUM_POINTS);
}

const addToRotateCameraX = (amt: number) => {
  if (amt < 0) {
    rotateCameraX = Math.max(rotateCameraX + amt, ROTATE_CAMERA_X_MIN_RADIANS)
  } else {
    rotateCameraX = Math.min(rotateCameraX + amt, ROTATE_CAMERA_X_MAX_RADIANS);
  }
}

const updateProjectionMatrixAndRender = () => {
  updateProjectionMatrix();
  requestAnimationFrame(render);
}

/** Create UI and attach event listeners to update global variables */
const initInputs = () => {
  // SET UP UI //////////////////////////////////////////////////////////////////////
  window.addEventListener('resize', updateProjectionMatrixAndRender);

  // move camera position with wasd
  window.addEventListener('keydown', (e) => {
    let updated = false;
    switch (e.key) {
      case 'w':
        addToRotateCameraX(-0.1);
        rotateCameraXInput.value = radiansToDegrees(rotateCameraX).toString();
        updated = true;
        break;
      case 'a':
        rotateCameraY += 0.1;
        rotateCameraYInput.value = radiansToDegrees(rotateCameraY).toString();
        updated = true;
        break;
      case 's':
        addToRotateCameraX(0.1);
        rotateCameraXInput.value = radiansToDegrees(rotateCameraX).toString();
        updated = true;
        break;
      case 'd':
        rotateCameraY -= 0.1;
        rotateCameraYInput.value = radiansToDegrees(rotateCameraY).toString();
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

  window.ontouchstart = (e) => {
    prevTouchY = e.touches[0]?.clientY;
    prevTouchX = e.touches[0]?.clientX;
  }

  window.ontouchmove = (e) => {
    const { width, height } = canvas.getBoundingClientRect();
    const nextClientX = e.touches[0]?.clientX;
    const nextClientY = e.touches[0]?.clientY;
    const dx = nextClientX - prevTouchX;
    const dy = nextClientY - prevTouchY;
    prevTouchX = nextClientX;
    prevTouchY = nextClientY;
    const px = dx / width;
    const py = dy / height;
    rotateCameraY += px * 5;
    addToRotateCameraX(-py * 5);
    updateProjectionMatrixAndRender();
  }

  window.onmousedown = (e) => {
    mouseDown = true;
    prevDragX = e.clientX;
    prevDragY = e.clientY;
  }

  window.onmousemove = (e) => {
    if (!mouseDown) return;
    const { width, height } = canvas.getBoundingClientRect();
    const nextClientX = e.clientX;
    const nextClientY = e.clientY;
    const dx = nextClientX - prevDragX;
    const dy = nextClientY - prevDragY;
    prevDragX = nextClientX;
    prevDragY = nextClientY;
    const px = dx / width;
    const py = dy / height;
    rotateCameraY += px * 5;
    addToRotateCameraX(-py * 5);
    updateProjectionMatrixAndRender();
  }

  window.onmouseup = () => mouseDown = false;
  window.onmouseleave = () => mouseDown = false;

  window.addEventListener('wheel', (e) => {
    if (e.deltaY < 0) {
      moveCameraZ += 0.1;
    } else {
      moveCameraZ -= 0.1;
    }
    updateProjectionMatrixAndRender();
  })

  scaleXInput.value = scaleX.toString();
  scaleXInput.addEventListener('input', (e: Event) => {
    scaleX = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrixAndRender();
  });

  scaleYInput.value = scaleY.toString();
  scaleYInput.addEventListener('input', (e: Event) => {
    scaleY = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrixAndRender();
  });

  scaleZInput.value = scaleZ.toString();
  scaleZInput.addEventListener('input', (e: Event) => {
    scaleZ = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrixAndRender();
  });

  translateXInput.value = translateX.toString();
  translateXInput.addEventListener('input', (e: Event) => {
    translateX = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrixAndRender();
  });

  translateYInput.value = translateY.toString();
  translateYInput.addEventListener('input', (e: Event) => {
    translateY = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrixAndRender();
  });

  translateZInput.value = translateZ.toString();
  translateZInput.addEventListener('input', (e: Event) => {
    translateZ = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrixAndRender();
  });

  rotateXInput.value = radiansToDegrees(rotateX).toString();
  rotateXInput.addEventListener('input', (e: Event) => {
    rotateX = degreesToRadians((e.target as HTMLInputElement).valueAsNumber);
    updateProjectionMatrixAndRender();
  });

  rotateYInput.value = radiansToDegrees(rotateY).toString();
  rotateYInput.addEventListener('input', (e: Event) => {
    rotateY = degreesToRadians((e.target as HTMLInputElement).valueAsNumber);
    updateProjectionMatrixAndRender();
  });

  rotateZInput.value = radiansToDegrees(rotateZ).toString();
  rotateZInput.addEventListener('input', (e: Event) => {
    rotateZ = degreesToRadians((e.target as HTMLInputElement).valueAsNumber);
    updateProjectionMatrixAndRender();
  });

  originXInput.value = originX.toString();
  originXInput.addEventListener('input', (e: Event) => {
    originX = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrixAndRender();
  });

  originYInput.value = originY.toString();
  originYInput.addEventListener('input', (e: Event) => {
    originY = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrixAndRender();
  });

  originZInput.value = originZ.toString();
  originZInput.addEventListener('input', (e: Event) => {
    originZ = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrixAndRender();
  });

  zNearInput.value = zNear.toString();
  zNearInput.addEventListener('input', (e: Event) => {
    zNear = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrixAndRender();
  });

  zFarInput.value = zFar.toString();
  zFarInput.addEventListener('input', (e: Event) => {
    zFar = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrixAndRender();
  });

  rotateCameraXInput.value = radiansToDegrees(rotateCameraX).toString();
  rotateCameraXInput.addEventListener('input', (e: Event) => {
    rotateCameraX = degreesToRadians((e.target as HTMLInputElement).valueAsNumber);
    updateProjectionMatrixAndRender();
  });

  rotateCameraYInput.value = radiansToDegrees(rotateCameraY).toString();
  rotateCameraYInput.min = radiansToDegrees(ROTATE_CAMERA_X_MIN_RADIANS).toString();
  rotateCameraYInput.max = radiansToDegrees(ROTATE_CAMERA_X_MAX_RADIANS).toString();
  rotateCameraYInput.addEventListener('input', (e: Event) => {
    rotateCameraY = degreesToRadians((e.target as HTMLInputElement).valueAsNumber);
    updateProjectionMatrixAndRender();
  });

  rotateCameraZInput.value = radiansToDegrees(rotateCameraZ).toString();
  rotateCameraZInput.addEventListener('input', (e: Event) => {
    rotateCameraZ = degreesToRadians((e.target as HTMLInputElement).valueAsNumber);
    updateProjectionMatrixAndRender();
  });

  moveCameraXInput.value = moveCameraX.toString();
  moveCameraXInput.addEventListener('input', (e: Event) => {
    moveCameraX = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrixAndRender();
  });

  moveCameraYInput.value = moveCameraY.toString();
  moveCameraYInput.addEventListener('input', (e: Event) => {
    moveCameraY = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrixAndRender();
  });

  moveCameraZInput.value = moveCameraZ.toString();
  moveCameraZInput.addEventListener('input', (e: Event) => {
    moveCameraZ = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrixAndRender();
  });
}


main();