import {
  createProgram, createTransformFeedbackProgram, createShader, degreesToRadians,
  err, matrix4x4, resizeCanvasToDisplaySize, createInput
} from "../utils";

const NUM_POINTS = 1_000_000;
// create an arrays of random points
const initialParticlePositions = new Float32Array(Array.from({ length: NUM_POINTS * 3 }, () => {
  return (2 * Math.random() - 1);
}));
const initialParticleColors = new Float32Array(Array.from({ length: NUM_POINTS * 3 }, () => {
  return Math.random();
}));

const ROTATE_CAMERA_X_MIN_RADIANS = degreesToRadians(-60);
const ROTATE_CAMERA_X_MAX_RADIANS = degreesToRadians(60);

// camera state
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

// wenbgl state
let gl: WebGL2RenderingContext;
let updateProgram: WebGLProgram;
let renderProgram: WebGLProgram;
let transformFeedback: WebGLTransformFeedback | null;
let projectionMatrix = matrix4x4.createIdentityMatrix();
let positionVboRead: WebGLBuffer;
let positionVboWrite: WebGLBuffer;
let colorVbo: WebGLBuffer;
let matrixLoc: WebGLUniformLocation;
let speedLoc: WebGLUniformLocation;
let lorenzLoc: WebGLUniformLocation;
let arneodoLoc: WebGLUniformLocation;
let burkeShawLoc: WebGLUniformLocation;
let chenLeeLoc: WebGLUniformLocation;
let aizawaLoc: WebGLUniformLocation;
let thomasLoc: WebGLUniformLocation;
let lorenzMod2Loc: WebGLUniformLocation;
let hadleyLoc: WebGLUniformLocation;
let halvorsenLoc: WebGLUniformLocation;
let threeScrollLoc: WebGLUniformLocation;
let coulletLoc: WebGLUniformLocation;
let dadrasLoc: WebGLUniformLocation;

let prevTouchX: number;
let prevTouchY: number;
let prevDragX: number;
let prevDragY: number;
let mouseDown = false;

// particle speed / interpolation state
let speed = 1;
let lorenzMultiplier = 1;
let arneodoMultiplier = 0;
let burkeShawMultiplier = 0;
let chenLeeMultiplier = 0;
let aizawaMultiplier = 0;
let thomasMultiplier = 0;
let lorenzMod2Multiplier = 0;
let hadleyMultiplier = 0;
let halvorsenMultiplier = 0;
let threeScrollMultiplier = 0;
let coulletMultiplier = 0;
let dadrasMultiplier = 0;

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const resetButton = document.querySelector('button') as HTMLButtonElement;
const loadingIndicator = document.querySelector('#loading') as HTMLParagraphElement;
const inputContainer = document.querySelector('.input-container') as HTMLDivElement;

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

  try {
    // create shaders from source code & link to program
    const updateVertexShader = createShader(gl, gl.VERTEX_SHADER, updateVertexShaderSource);
    const updateFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, updateFragmentShaderSource);
    updateProgram = createTransformFeedbackProgram(gl, updateVertexShader, updateFragmentShader, ['o_position']);
    transformFeedback = gl.createTransformFeedback();

    const drawVertexShader = createShader(gl, gl.VERTEX_SHADER, drawVertexShaderSource);
    const drawFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, drawFragmentShaderSource);
    renderProgram = createProgram(gl, drawVertexShader, drawFragmentShader);
  } catch (e) {
    console.error(e);
    loadingIndicator.textContent = `Error occurred: ${e}`;
  }

  speedLoc = gl.getUniformLocation(updateProgram, 'u_speed') as WebGLUniformLocation;
  lorenzLoc = gl.getUniformLocation(updateProgram, 'lorenz_multiplier') as WebGLUniformLocation;
  arneodoLoc = gl.getUniformLocation(updateProgram, 'arneodo_multiplier') as WebGLUniformLocation;
  burkeShawLoc = gl.getUniformLocation(updateProgram, 'burke_shaw_multiplier') as WebGLUniformLocation;
  chenLeeLoc = gl.getUniformLocation(updateProgram, 'chen_lee_multiplier') as WebGLUniformLocation;
  aizawaLoc = gl.getUniformLocation(updateProgram, 'aizawa_multiplier') as WebGLUniformLocation;
  thomasLoc = gl.getUniformLocation(updateProgram, 'thomas_multiplier') as WebGLUniformLocation;
  lorenzMod2Loc = gl.getUniformLocation(updateProgram, 'lorenz_mod_2_multiplier') as WebGLUniformLocation;
  hadleyLoc = gl.getUniformLocation(updateProgram, 'hadley_multiplier') as WebGLUniformLocation;
  halvorsenLoc = gl.getUniformLocation(updateProgram, 'halvorsen_multiplier') as WebGLUniformLocation;
  threeScrollLoc = gl.getUniformLocation(updateProgram, 'three_scrolls_multiplier') as WebGLUniformLocation;
  coulletLoc = gl.getUniformLocation(updateProgram, 'coullet_multiplier') as WebGLUniformLocation;
  dadrasLoc = gl.getUniformLocation(updateProgram, 'dadras_multiplier') as WebGLUniformLocation;
  matrixLoc = gl.getUniformLocation(renderProgram, 'u_matrix') as WebGLUniformLocation;

  // initialize buffers
  positionVboRead = createVbo(gl, initialParticlePositions, gl.DYNAMIC_COPY);
  positionVboWrite = createVbo(gl, new Float32Array(NUM_POINTS * 3), gl.DYNAMIC_COPY);
  colorVbo = createVbo(gl, initialParticleColors);

  // SET UNIFORMS //////////////////////////////////////////////////////////////////
  updateProjectionMatrix();

  // END LOADING ////////////////////////////////////////////////////////////////
  loadingIndicator.remove();

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
  gl.uniform1f(speedLoc, speed);
  gl.uniform1f(lorenzLoc, lorenzMultiplier);
  gl.uniform1f(arneodoLoc, arneodoMultiplier);
  gl.uniform1f(burkeShawLoc, burkeShawMultiplier);
  gl.uniform1f(chenLeeLoc, chenLeeMultiplier);
  gl.uniform1f(aizawaLoc, aizawaMultiplier);
  gl.uniform1f(thomasLoc, thomasMultiplier);
  gl.uniform1f(lorenzMod2Loc, lorenzMod2Multiplier);
  gl.uniform1f(hadleyLoc, hadleyMultiplier);
  gl.uniform1f(halvorsenLoc, halvorsenMultiplier);
  gl.uniform1f(threeScrollLoc, threeScrollMultiplier);
  gl.uniform1f(coulletLoc, coulletMultiplier);
  gl.uniform1f(dadrasLoc, dadrasMultiplier);
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
  gl.uniformMatrix4fv(matrixLoc, false, viewProjectionMatrix);

  gl.drawArrays(gl.POINTS, 0, NUM_POINTS);
}

const reset = () => {
  positionVboRead = createVbo(gl, initialParticlePositions, gl.DYNAMIC_COPY);
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
        updated = true;
        break;
      case 'a':
        rotateCameraY += 0.1;
        updated = true;
        break;
      case 's':
        addToRotateCameraX(0.1);
        updated = true;
        break;
      case 'd':
        rotateCameraY -= 0.1;
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
    const INCREMENT = 0.01;
    if (e.deltaY < 0) {
      moveCameraZ *= 1 + INCREMENT;
    } else {
      moveCameraZ *= 1 - INCREMENT;
    }
    updateProjectionMatrix();
  });

  resetButton.onclick = reset;

  const speedInput = createInput({
    label: 'Speed',
    type: 'range',
    min: 0,
    max: 10,
    step: 0.0001,
    className: 'margin-bottom',
    initialValue: speed,
    oninput: (e, currentValueIndicator) => {
      const value = (e.target as HTMLInputElement).valueAsNumber;
      currentValueIndicator.textContent = value.toString();
      speed = value;
    },
  })
  
  const ATTRACTOR_DEFAULTS = {
    type: 'range',
    min: 0,
    max: 10,
    step: 0.001,
  }
  const lorenzInput = createInput({
    ...ATTRACTOR_DEFAULTS,
    label: 'Lorenz',
    initialValue: lorenzMultiplier,
    oninput: (e, currentValueIndicator) => {
      const value = (e.target as HTMLInputElement).valueAsNumber;
      currentValueIndicator.textContent = value.toString();
      lorenzMultiplier = value;
    },
  });
  const arneodoInput = createInput({
    ...ATTRACTOR_DEFAULTS,
    label: 'Arneodo',
    initialValue: arneodoMultiplier,
    oninput: (e, currentValueIndicator) => {
      const value = (e.target as HTMLInputElement).valueAsNumber;
      currentValueIndicator.textContent = value.toString();
      arneodoMultiplier = value;
    },
  });
  const burkeShawInput = createInput({
    ...ATTRACTOR_DEFAULTS,
    label: 'Burke-Shaw',
    initialValue: burkeShawMultiplier,
    oninput: (e, currentValueIndicator) => {
      const value = (e.target as HTMLInputElement).valueAsNumber;
      currentValueIndicator.textContent = value.toString();
      burkeShawMultiplier = value;
    },
  });
  const chenLeeInput = createInput({
    ...ATTRACTOR_DEFAULTS,
    label: 'Chen-Lee',
    initialValue: chenLeeMultiplier,
    oninput: (e, currentValueIndicator) => {
      const value = (e.target as HTMLInputElement).valueAsNumber;
      currentValueIndicator.textContent = value.toString();
      chenLeeMultiplier = value;
    },
  });
  const aizawaInput = createInput({
    ...ATTRACTOR_DEFAULTS,
    label: 'Aizawa',
    initialValue: aizawaMultiplier,
    oninput: (e, currentValueIndicator) => {
      const value = (e.target as HTMLInputElement).valueAsNumber;
      currentValueIndicator.textContent = value.toString();
      aizawaMultiplier = value;
    },
  });
  const thomasInput = createInput({
    ...ATTRACTOR_DEFAULTS,
    label: 'Thomas',
    initialValue: thomasMultiplier,
    oninput: (e, currentValueIndicator) => {
      const value = (e.target as HTMLInputElement).valueAsNumber;
      currentValueIndicator.textContent = value.toString();
      thomasMultiplier = value;
    },
  });
  const lorenzMod2Input = createInput({
    ...ATTRACTOR_DEFAULTS,
    label: 'Lorenz',
    initialValue: lorenzMod2Multiplier,
    oninput: (e, currentValueIndicator) => {
      const value = (e.target as HTMLInputElement).valueAsNumber;
      currentValueIndicator.textContent = value.toString();
      lorenzMod2Multiplier = value;
    },
  });
  const hadleyInput = createInput({
    ...ATTRACTOR_DEFAULTS,
    label: 'Hadley',
    initialValue: hadleyMultiplier,
    oninput: (e, currentValueIndicator) => {
      const value = (e.target as HTMLInputElement).valueAsNumber;
      currentValueIndicator.textContent = value.toString();
      hadleyMultiplier = value;
    },
  });
  const halvorsenInput = createInput({
    ...ATTRACTOR_DEFAULTS,
    label: 'Halvorsen',
    initialValue: halvorsenMultiplier,
    oninput: (e, currentValueIndicator) => {
      const value = (e.target as HTMLInputElement).valueAsNumber;
      currentValueIndicator.textContent = value.toString();
      halvorsenMultiplier = value;
    },
  });
  const threeScrollInput = createInput({
    ...ATTRACTOR_DEFAULTS,
    label: 'Three-Scroll Unified Chaotic System',
    initialValue: threeScrollMultiplier,
    oninput: (e, currentValueIndicator) => {
      const value = (e.target as HTMLInputElement).valueAsNumber;
      currentValueIndicator.textContent = value.toString();
      threeScrollMultiplier = value;
    },
  });
  const coulletInput = createInput({
    ...ATTRACTOR_DEFAULTS,
    label: 'Coullet',
    initialValue: coulletMultiplier,
    oninput: (e, currentValueIndicator) => {
      const value = (e.target as HTMLInputElement).valueAsNumber;
      currentValueIndicator.textContent = value.toString();
      coulletMultiplier = value;
    },
  });
  const dadrasInput = createInput({
    ...ATTRACTOR_DEFAULTS,
    label: 'Dadras',
    initialValue: dadrasMultiplier,
    oninput: (e, currentValueIndicator) => {
      const value = (e.target as HTMLInputElement).valueAsNumber;
      currentValueIndicator.textContent = value.toString();
      dadrasMultiplier = value;
    },
  });
  
  inputContainer.append(
    speedInput,
    lorenzInput,
    arneodoInput,
    burkeShawInput,
    chenLeeInput,
    aizawaInput,
    thomasInput,
    lorenzMod2Input,
    hadleyInput,
    halvorsenInput,
    threeScrollInput,
    coulletInput,
    dadrasInput
  )
}


main();