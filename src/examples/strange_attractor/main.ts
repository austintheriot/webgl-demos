import {
  createProgram, createTransformFeedbackProgram, createShader, degreesToRadians, err, matrix4x4,
  radiansToDegrees, resizeCanvasToDisplaySize
} from "../utils";

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
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
const dtInput = document.querySelector('#dt') as HTMLInputElement;

const ROTATE_CAMERA_X_MIN_RADIANS = degreesToRadians(-60);
const ROTATE_CAMERA_X_MAX_RADIANS = degreesToRadians(60);

let dt = 0.001;

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
let translateZ = -100;

let originX = 0;
let originY = 0;
let originZ = 0;

let cameraAngleRadians = degreesToRadians(60);
let zNear = 0.1;
let zFar = 2000;

let gl: WebGL2RenderingContext;
let updateProgram: WebGLProgram;
let renderProgram: WebGLProgram;
let matrixUniformLocation: WebGLUniformLocation;
let deltaTimeUniformLocation: WebGLUniformLocation;
let transformFeedback: WebGLTransformFeedback | null;
let projectionMatrix = matrix4x4.createIdentityMatrix();
let positionVboRead: WebGLBuffer;
let positionVboWrite: WebGLBuffer;
let colorVbo: WebGLBuffer;

let prevTouchX: number;
let prevTouchY: number;
let prevDragX: number;
let prevDragY: number;
let mouseDown = false;

const NUM_POINTS = 100_000;
// create an arrays of random points
const initialParticlePositions = new Float32Array(Array.from({ length: NUM_POINTS * 3 }, () => {
  return (2 * Math.random() - 1);
}));
const initialParticleColors = new Float32Array(Array.from({ length: NUM_POINTS * 3 }, () => {
  return Math.random();
}));

const createVbo = (gl: WebGL2RenderingContext, array: BufferSource | null, usage?: number) => {
  const vbo = gl.createBuffer();
  if (!vbo) throw new Error('error creating buffer');
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, array, usage !== undefined ? usage : gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return vbo;
}

const swapParticleVbos = function () {
  const tempBuffer = positionVboRead;
  positionVboRead = positionVboWrite;
  positionVboWrite = tempBuffer;
}


const main = async () => {
  initUI();
  gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
  if (!gl) throw err('WebGL not supported', { gl });

  // fetch all shader sources
  const [
    updateVertexShaderSource,
    updateFragmentShaderSource,
    drawVertexShaderSource,
    drawFragmentShaderSource
  ] = await Promise.all([
    fetch('./update_vertex.glsl'),
    fetch('./update_fragment.glsl'),
    fetch('./draw_vertex.glsl'),
    fetch('./draw_fragment.glsl'),
  ]).then(([
    updateVertex,
    updateFragment,
    drawVertex,
    drawFragment
  ]) => Promise.all([
    updateVertex.text(),
    updateFragment.text(),
    drawVertex.text(),
    drawFragment.text()
  ]));

  // create shaders from source code & link to program
  const updateVertexShader = createShader(gl, gl.VERTEX_SHADER, updateVertexShaderSource);
  const updateFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, updateFragmentShaderSource);
  updateProgram = createTransformFeedbackProgram(gl, updateVertexShader, updateFragmentShader, ['o_position']);
  transformFeedback = gl.createTransformFeedback();

  const drawVertexShader = createShader(gl, gl.VERTEX_SHADER, drawVertexShaderSource);
  const drawFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, drawFragmentShaderSource);
  renderProgram = createProgram(gl, drawVertexShader, drawFragmentShader);

  // look up where the vertex data needs to go
  deltaTimeUniformLocation = gl.getUniformLocation(updateProgram, 'u_dt') as WebGLUniformLocation;
  matrixUniformLocation = gl.getUniformLocation(renderProgram, 'u_matrix') as WebGLUniformLocation;

  // initialize buffers
  positionVboRead = createVbo(gl, initialParticlePositions, gl.DYNAMIC_COPY);
  positionVboWrite = createVbo(gl, new Float32Array(NUM_POINTS * 3), gl.DYNAMIC_COPY);
  colorVbo = createVbo(gl, initialParticleColors);

  // SET UNIFORMS //////////////////////////////////////////////////////////////////
  updateProjectionMatrix();

  // RENDER //////////////////////////////////////////////////////////////////
  animate();
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
  // update particle positions
  gl.useProgram(updateProgram);

  // update uniforms / buffers
  gl.uniform1f(deltaTimeUniformLocation, dt);
  [positionVboRead].forEach((vbo, i) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.enableVertexAttribArray(i);
    gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 0, 0);
  });

  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, positionVboWrite);
  gl.enable(gl.RASTERIZER_DISCARD);
  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(gl.POINTS, 0, NUM_POINTS);
  gl.disable(gl.RASTERIZER_DISCARD);
  gl.endTransformFeedback();
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
  swapParticleVbos();

  // render particles to canvas
  gl.useProgram(renderProgram);

  resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.enable(gl.BLEND);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  [positionVboRead, colorVbo].forEach((vbo, i) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.enableVertexAttribArray(i);
    gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 0, 0);
  });

  // set view projection matrix
  let cameraMatrix = matrix4x4.createIdentityMatrix();
  cameraMatrix = matrix4x4.rotateY(cameraMatrix, rotateCameraY);
  cameraMatrix = matrix4x4.rotateX(cameraMatrix, rotateCameraX);
  cameraMatrix = matrix4x4.rotateZ(cameraMatrix, rotateCameraZ);
  cameraMatrix = matrix4x4.translate(cameraMatrix, moveCameraX, moveCameraY, moveCameraZ);
  const viewMatrix = matrix4x4.inverse(cameraMatrix);
  const viewProjectionMatrix = matrix4x4.multiply(projectionMatrix, viewMatrix);
  gl.uniformMatrix4fv(matrixUniformLocation, false, viewProjectionMatrix);

  gl.drawArrays(gl.POINTS, 0, NUM_POINTS);
}

const animate = () => {
  render();
  requestAnimationFrame(animate);
}

const addToRotateCameraX = (amt: number) => {
  if (amt < 0) {
    rotateCameraX = Math.max(rotateCameraX + amt, ROTATE_CAMERA_X_MIN_RADIANS)
  } else {
    rotateCameraX = Math.min(rotateCameraX + amt, ROTATE_CAMERA_X_MAX_RADIANS);
  }
}

/** Create UI and attach event listeners to update global variables */
const initUI = () => {
  // SET UP UI //////////////////////////////////////////////////////////////////////
  canvas.addEventListener('resize', updateProjectionMatrix);

  // move camera position with wasd
  canvas.addEventListener('keydown', (e) => {
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

  canvas.ontouchstart = (e) => {
    prevTouchY = e.touches[0]?.clientY;
    prevTouchX = e.touches[0]?.clientX;
  }

  canvas.ontouchmove = (e) => {
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
    updateProjectionMatrix();
  }

  canvas.onmousedown = (e) => {
    mouseDown = true;
    prevDragX = e.clientX;
    prevDragY = e.clientY;
  }

  canvas.onmousemove = (e) => {
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
    updateProjectionMatrix();
  }

  canvas.onmouseup = () => mouseDown = false;
  canvas.onmouseleave = () => mouseDown = false;

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      moveCameraZ *= 1.01;
    } else {
      moveCameraZ *= 0.99;
    }
    updateProjectionMatrix();
  })

  scaleXInput.value = scaleX.toString();
  scaleXInput.addEventListener('input', (e: Event) => {
    scaleX = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
  });

  scaleYInput.value = scaleY.toString();
  scaleYInput.addEventListener('input', (e: Event) => {
    scaleY = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
  });

  scaleZInput.value = scaleZ.toString();
  scaleZInput.addEventListener('input', (e: Event) => {
    scaleZ = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
  });

  translateXInput.value = translateX.toString();
  translateXInput.addEventListener('input', (e: Event) => {
    translateX = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
  });

  translateYInput.value = translateY.toString();
  translateYInput.addEventListener('input', (e: Event) => {
    translateY = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
  });

  translateZInput.value = translateZ.toString();
  translateZInput.addEventListener('input', (e: Event) => {
    translateZ = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
  });

  rotateXInput.value = radiansToDegrees(rotateX).toString();
  rotateXInput.addEventListener('input', (e: Event) => {
    rotateX = degreesToRadians((e.target as HTMLInputElement).valueAsNumber);
    updateProjectionMatrix();
  });

  rotateYInput.value = radiansToDegrees(rotateY).toString();
  rotateYInput.addEventListener('input', (e: Event) => {
    rotateY = degreesToRadians((e.target as HTMLInputElement).valueAsNumber);
    updateProjectionMatrix();
  });

  rotateZInput.value = radiansToDegrees(rotateZ).toString();
  rotateZInput.addEventListener('input', (e: Event) => {
    rotateZ = degreesToRadians((e.target as HTMLInputElement).valueAsNumber);
    updateProjectionMatrix();
  });

  originXInput.value = originX.toString();
  originXInput.addEventListener('input', (e: Event) => {
    originX = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
  });

  originYInput.value = originY.toString();
  originYInput.addEventListener('input', (e: Event) => {
    originY = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
  });

  originZInput.value = originZ.toString();
  originZInput.addEventListener('input', (e: Event) => {
    originZ = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
  });

  zNearInput.value = zNear.toString();
  zNearInput.addEventListener('input', (e: Event) => {
    zNear = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
  });

  zFarInput.value = zFar.toString();
  zFarInput.addEventListener('input', (e: Event) => {
    zFar = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
  });

  rotateCameraXInput.value = radiansToDegrees(rotateCameraX).toString();
  rotateCameraXInput.addEventListener('input', (e: Event) => {
    rotateCameraX = degreesToRadians((e.target as HTMLInputElement).valueAsNumber);
    updateProjectionMatrix();
  });

  rotateCameraYInput.value = radiansToDegrees(rotateCameraY).toString();
  rotateCameraYInput.min = radiansToDegrees(ROTATE_CAMERA_X_MIN_RADIANS).toString();
  rotateCameraYInput.max = radiansToDegrees(ROTATE_CAMERA_X_MAX_RADIANS).toString();
  rotateCameraYInput.addEventListener('input', (e: Event) => {
    rotateCameraY = degreesToRadians((e.target as HTMLInputElement).valueAsNumber);
    updateProjectionMatrix();
  });

  rotateCameraZInput.value = radiansToDegrees(rotateCameraZ).toString();
  rotateCameraZInput.addEventListener('input', (e: Event) => {
    rotateCameraZ = degreesToRadians((e.target as HTMLInputElement).valueAsNumber);
    updateProjectionMatrix();
  });

  moveCameraXInput.value = moveCameraX.toString();
  moveCameraXInput.addEventListener('input', (e: Event) => {
    moveCameraX = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
  });

  moveCameraYInput.value = moveCameraY.toString();
  moveCameraYInput.addEventListener('input', (e: Event) => {
    moveCameraY = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
  });

  moveCameraZInput.value = moveCameraZ.toString();
  moveCameraZInput.addEventListener('input', (e: Event) => {
    moveCameraZ = (e.target as HTMLInputElement).valueAsNumber;
    updateProjectionMatrix();
  });

  dtInput.value = dt.toString();
  dtInput.addEventListener('input', (e: Event) => {
    dt = (e.target as HTMLInputElement).valueAsNumber;
  });
}


main();