import {
  createProgram, createShader, degreesToRadians,
  err, matrix4x4, resizeCanvasToDisplaySize, createInput
} from "../utils";
import renderFragmentShaderSource from './render_fragment.glsl?raw'
import renderVertexShaderSource from './render_vertex.glsl?raw'

const NUM_POINTS = 2_500_000;
const ROTATE_X_MIN_RADIANS = degreesToRadians(-60);
const ROTATE_X_MAX_RADIANS = degreesToRadians(60);

const INITIAL_VALUES = {
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  translateZ: -5,

  a: 2,
  b: 3,
  c: 2,
  d: 3.001,
  e: 1,
  f: 1,
}

// camera state
let rotateCameraX = 0;
let rotateCameraY = 0;
let rotateCameraZ = 0;

let moveCameraX = 0;
let moveCameraY = 0;
let moveCameraZ = 1;

let scaleX = 1;
let scaleY = 1;
let scaleZ = 1;

let rotateX = INITIAL_VALUES.rotateX;
let rotateY = INITIAL_VALUES.rotateY;
let rotateZ = INITIAL_VALUES.rotateZ;

let translateX = 0;
let translateY = 0;
let translateZ = INITIAL_VALUES.translateZ;

let originX = 0;
let originY = 0;
let originZ = 0;

let cameraAngleRadians = degreesToRadians(60);
let zNear = 0.1;
let zFar = 2000;

// wenbgl state
/** only renders again when a change has been made to inputs */
let shouldRender = true;
let gl: WebGL2RenderingContext;
let renderProgram: WebGLProgram;
let projectionMatrix = matrix4x4.createIdentityMatrix();
let indexBuffer: WebGLBuffer;

let matrixLoc: WebGLUniformLocation;
let aLoc: WebGLUniformLocation;
let bLoc: WebGLUniformLocation;
let cLoc: WebGLUniformLocation;
let dLoc: WebGLUniformLocation;
let eLoc: WebGLUniformLocation;
let fLoc: WebGLUniformLocation;

let prevTouchX: number;
let prevTouchY: number;
let prevDragX: number;
let prevDragY: number;
let mouseDown = false;

// particle speed state
// create an arrays of random points
let indexes: Float32Array;
let a = INITIAL_VALUES.a;
let b = INITIAL_VALUES.b;
let c = INITIAL_VALUES.c;
let d = INITIAL_VALUES.d;
let e = INITIAL_VALUES.e;
let f = INITIAL_VALUES.f;

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const resetParticlesButton = document.querySelector('#reset-particles') as HTMLButtonElement;
const resetEverythingButton = document.querySelector('#reset-everything') as HTMLButtonElement;
const saveImageButton = document.querySelector('#save-image') as HTMLButtonElement;
const messageElement = document.querySelector('#message') as HTMLParagraphElement;
const inputContainer = document.querySelector('.input-container') as HTMLDivElement;
const INPUT_DEFAULTS = {
  type: 'number',
  min: 0,
  max: 10,
  step: 0.001,
}
const aInput = createInput({
  ...INPUT_DEFAULTS,
  label: 'a',
  initialValue: a,
  useCurrentValueIndicator: false,
  oninput: (e) => {
    const value = (e.target as HTMLInputElement).valueAsNumber;
    a = value;
    shouldRender = true;
  },
});
const bInput = createInput({
  ...INPUT_DEFAULTS,
  label: 'b',
  initialValue: b,
  useCurrentValueIndicator: false,
  oninput: (e) => {
    const value = (e.target as HTMLInputElement).valueAsNumber;
    b = value;
    shouldRender = true;
  },
});
const cInput = createInput({
  ...INPUT_DEFAULTS,
  label: 'c',
  initialValue: c,
  useCurrentValueIndicator: false,
  oninput: (e) => {
    const value = (e.target as HTMLInputElement).valueAsNumber;
    c = value;
    shouldRender = true;
  },
});
const dInput = createInput({
  ...INPUT_DEFAULTS,
  label: 'd',
  initialValue: d,
  useCurrentValueIndicator: false,
  oninput: (e) => {
    const value = (e.target as HTMLInputElement).valueAsNumber;
    d = value;
    shouldRender = true;
  },
});
const eInput = createInput({
  ...INPUT_DEFAULTS,
  label: 'e',
  initialValue: e,
  useCurrentValueIndicator: false,
  oninput: (event) => {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    e = value;
    shouldRender = true;
  },
});
const fInput = createInput({
  ...INPUT_DEFAULTS,
  label: 'f',
  initialValue: f,
  useCurrentValueIndicator: false,
  oninput: (e) => {
    const value = (e.target as HTMLInputElement).valueAsNumber;
    f = value;
    shouldRender = true;
  },
});

inputContainer.append(
  aInput,
  bInput,
  cInput,
  dInput,
  eInput,
  fInput,
)

const resetStateValues = () => {
  rotateX = INITIAL_VALUES.rotateX;
  rotateY = INITIAL_VALUES.rotateY;
  rotateZ = INITIAL_VALUES.rotateZ;
  translateZ = INITIAL_VALUES.translateZ;
  a = INITIAL_VALUES.a;
  b = INITIAL_VALUES.b;
  c = INITIAL_VALUES.c;
  d = INITIAL_VALUES.d;
  e = INITIAL_VALUES.e;
  f = INITIAL_VALUES.f;
  shouldRender = true;
}

const resetGui = () => {
  // update input values
  aInput.querySelector('input')!.value = INITIAL_VALUES.a.toString();
  bInput.querySelector('input')!.value = INITIAL_VALUES.b.toString();
  cInput.querySelector('input')!.value = INITIAL_VALUES.c.toString();
  dInput.querySelector('input')!.value = INITIAL_VALUES.d.toString();
  eInput.querySelector('input')!.value = INITIAL_VALUES.e.toString();
  fInput.querySelector('input')!.value = INITIAL_VALUES.f.toString();
  shouldRender = true;
}

const createVbo = (gl: WebGL2RenderingContext, array: BufferSource | null, usage?: number) => {
  const vbo = gl.createBuffer();
  if (!vbo) throw new Error('error creating buffer');
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, array, usage !== undefined ? usage : gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return vbo;
}

const main = async () => {
  gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
  if (!gl) throw err('WebGL not supported', { gl });

  resetStateValues();
  resetGui();
  addEventListeners();

  // create initial particle positions
  indexes = new Float32Array(Array.from({ length: NUM_POINTS }, (_, i) => i / 100));

  try {
    const renderVertexShader = createShader(gl, gl.VERTEX_SHADER, renderVertexShaderSource);
    const renderFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, renderFragmentShaderSource);
    renderProgram = createProgram(gl, renderVertexShader, renderFragmentShader);
  } catch (e) {
    console.error(e);
    messageElement.textContent = `Error occurred: ${e}`;
  }

  matrixLoc = gl.getUniformLocation(renderProgram, 'u_matrix') as WebGLUniformLocation;
  aLoc = gl.getUniformLocation(renderProgram, 'u_a') as WebGLUniformLocation;
  bLoc = gl.getUniformLocation(renderProgram, 'u_b') as WebGLUniformLocation;
  cLoc = gl.getUniformLocation(renderProgram, 'u_c') as WebGLUniformLocation;
  dLoc = gl.getUniformLocation(renderProgram, 'u_d') as WebGLUniformLocation;
  eLoc = gl.getUniformLocation(renderProgram, 'u_e') as WebGLUniformLocation;
  fLoc = gl.getUniformLocation(renderProgram, 'u_f') as WebGLUniformLocation;

  // initialize buffers
  indexBuffer = createVbo(gl, indexes, gl.DYNAMIC_COPY);

  // SET UNIFORMS //////////////////////////////////////////////////////////////////
  updateProjectionMatrix();

  // END LOADING ////////////////////////////////////////////////////////////////
  messageElement.remove();

  // RENDER //////////////////////////////////////////////////////////////////
  animate();
}

/** Update transformation matrix with new transformation state */
const updateProjectionMatrix = () => {
  shouldRender = true;
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
  shouldRender = false;

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

  // update uniforms / buffers
  gl.uniform1f(aLoc, a);
  gl.uniform1f(bLoc, b);
  gl.uniform1f(cLoc, c);
  gl.uniform1f(dLoc, d);
  gl.uniform1f(eLoc, e);
  gl.uniform1f(fLoc, f);

  // use forEach for extensibility later
  [indexBuffer].forEach((vbo, i) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.enableVertexAttribArray(i);
    gl.vertexAttribPointer(i, 1, gl.FLOAT, false, 0, 0);
  });

  // set view projection matrix
  let cameraMatrix = matrix4x4.createIdentityMatrix();
  cameraMatrix = matrix4x4.rotateY(cameraMatrix, rotateCameraY);
  cameraMatrix = matrix4x4.rotateX(cameraMatrix, rotateCameraX);
  cameraMatrix = matrix4x4.rotateZ(cameraMatrix, rotateCameraZ);
  cameraMatrix = matrix4x4.translate(cameraMatrix, moveCameraX, moveCameraY, moveCameraZ);
  const viewMatrix = matrix4x4.inverse(cameraMatrix);
  const viewProjectionMatrix = matrix4x4.multiply(projectionMatrix, viewMatrix);
  gl.uniformMatrix4fv(matrixLoc, false, viewProjectionMatrix);

  gl.drawArrays(gl.POINTS, 0, NUM_POINTS);
}

const resetEverything = () => {
  resetStateValues();
  resetGui();
  updateProjectionMatrix();
  shouldRender = true;
}

const animate = () => {
  if (shouldRender) render();
  requestAnimationFrame(animate);
}

/** Prevents exceeding x-rotation boundaries */
const addToRotateX = (amt: number) => {
  if (amt < 0) {
    rotateX = Math.max(rotateX + amt, ROTATE_X_MIN_RADIANS)
  } else {
    rotateX = Math.min(rotateX + amt, ROTATE_X_MAX_RADIANS);
  }
}

/** Create UI and attach event listeners to update global variables */
const addEventListeners = () => {
  // SET UP UI //////////////////////////////////////////////////////////////////////
  window.addEventListener('resize', updateProjectionMatrix);

  // move camera position with wasd
  window.addEventListener('keydown', (e) => {
    let updated = false;
    switch (e.key) {
      case 'w':
        addToRotateX(-0.05);
        updated = true;
        break;
      case 'a':
        rotateY += 0.05;
        updated = true;
        break;
      case 's':
        addToRotateX(0.05);
        updated = true;
        break;
      case 'd':
        rotateY -= 0.05;
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
    rotateY -= px * 5;
    addToRotateX(-py * 5);
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
    rotateY -= px * 5;
    addToRotateX(-py * 5);
    updateProjectionMatrix();
  }

  canvas.onmouseup = () => mouseDown = false;
  canvas.onmouseleave = () => mouseDown = false;

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const INCREMENT = 0.01;
    if (e.deltaY < 0) {
      translateZ *= 1 - INCREMENT;
    } else {
      translateZ *= 1 + INCREMENT;
    }
    updateProjectionMatrix();
  });

  resetEverythingButton.onclick = resetEverything;

  // take screenshot on click
  const link = document.createElement('a');
  document.body.appendChild(link);
  link.style.display = 'none';
  const saveBlob = (blob: Blob | null, fileName: string) => {
    if (!blob) return;
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    link.click();
  };
  saveImageButton.onclick = () => {
    render();
    canvas.toBlob((blob) => {
      saveBlob(blob, `particles.png`);
    });
  }
}


main();