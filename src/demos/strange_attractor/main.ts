import {
  createProgram, createTransformFeedbackProgram, createShader, degreesToRadians,
  err, matrix4x4, resizeCanvasToDisplaySize, createInput
} from "../../utils";
import drawFragmentShaderSource from './draw_fragment.glsl?raw'
import drawVertexShaderSource from './draw_vertex.glsl?raw'
import updateFragmentShaderSource from './update_fragment.glsl?raw'
import updateVertexShaderSource from './update_vertex.glsl?raw'

const NUM_POINTS = 100_000;
const ROTATE_X_MIN_RADIANS = degreesToRadians(-60);
const ROTATE_X_MAX_RADIANS = degreesToRadians(60);

const INITIAL_VALUES = {
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  translateZ: -100,

  speed: 1.5,
  lorenzMultiplier: 1,
  arneodoMultiplier: 0,
  burkeShawMultiplier: 0,
  chenLeeMultiplier: 0,
  aizawaMultiplier: 0,
  thomasMultiplier: 0,
  lorenzMod2Multiplier: 0,
  hadleyMultiplier: 0,
  halvorsenMultiplier: 0,
  threeScrollMultiplier: 0,
  coulletMultiplier: 0,
  dadrasMultiplier: 0,
}

// camera state
let rotateCameraX = 0;
let rotateCameraY = 0;
let rotateCameraZ = 0;

let moveCameraX = 0;
let moveCameraY = 0;
let moveCameraZ = 10;

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
let gl: WebGL2RenderingContext;
let updateProgram: WebGLProgram;
let renderProgram: WebGLProgram;
let transformFeedback: WebGLTransformFeedback | null;
let projectionMatrix = matrix4x4.createIdentityMatrix();
let positionVboRead: WebGLBuffer;
let positionVboWrite: WebGLBuffer;
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

// particle speed state
// create an arrays of random points
let initialParticlePositions: Float32Array;
let speed = INITIAL_VALUES.speed;
let lorenzMultiplier = INITIAL_VALUES.lorenzMultiplier;
let arneodoMultiplier = INITIAL_VALUES.arneodoMultiplier;
let burkeShawMultiplier = INITIAL_VALUES.burkeShawMultiplier;
let chenLeeMultiplier = INITIAL_VALUES.chenLeeMultiplier;
let aizawaMultiplier = INITIAL_VALUES.aizawaMultiplier;
let thomasMultiplier = INITIAL_VALUES.thomasMultiplier;
let lorenzMod2Multiplier = INITIAL_VALUES.lorenzMod2Multiplier;
let hadleyMultiplier = INITIAL_VALUES.hadleyMultiplier;
let halvorsenMultiplier = INITIAL_VALUES.halvorsenMultiplier;
let threeScrollMultiplier = INITIAL_VALUES.threeScrollMultiplier;
let coulletMultiplier = INITIAL_VALUES.coulletMultiplier;
let dadrasMultiplier = INITIAL_VALUES.dadrasMultiplier;

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const resetParticlesButton = document.querySelector('#reset-particles') as HTMLButtonElement;
const resetEverythingButton = document.querySelector('#reset-everything') as HTMLButtonElement;
const saveImageButton = document.querySelector('#save-image') as HTMLButtonElement;
const loadingIndicator = document.querySelector('#loading') as HTMLParagraphElement;
const inputContainer = document.querySelector('.input-container') as HTMLDivElement;
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
    if (currentValueIndicator) currentValueIndicator.textContent = value.toString();
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
    if (currentValueIndicator) currentValueIndicator.textContent = value.toString();
    lorenzMultiplier = value;
  },
});
const arneodoInput = createInput({
  ...ATTRACTOR_DEFAULTS,
  label: 'Arneodo',
  initialValue: arneodoMultiplier,
  oninput: (e, currentValueIndicator) => {
    const value = (e.target as HTMLInputElement).valueAsNumber;
    if (currentValueIndicator) currentValueIndicator.textContent = value.toString();
    arneodoMultiplier = value;
  },
});
const burkeShawInput = createInput({
  ...ATTRACTOR_DEFAULTS,
  label: 'Burke-Shaw',
  initialValue: burkeShawMultiplier,
  oninput: (e, currentValueIndicator) => {
    const value = (e.target as HTMLInputElement).valueAsNumber;
    if (currentValueIndicator) currentValueIndicator.textContent = value.toString();
    burkeShawMultiplier = value;
  },
});
const chenLeeInput = createInput({
  ...ATTRACTOR_DEFAULTS,
  label: 'Chen-Lee',
  initialValue: chenLeeMultiplier,
  oninput: (e, currentValueIndicator) => {
    const value = (e.target as HTMLInputElement).valueAsNumber;
    if (currentValueIndicator) currentValueIndicator.textContent = value.toString();
    chenLeeMultiplier = value;
  },
});
const aizawaInput = createInput({
  ...ATTRACTOR_DEFAULTS,
  label: 'Aizawa',
  initialValue: aizawaMultiplier,
  oninput: (e, currentValueIndicator) => {
    const value = (e.target as HTMLInputElement).valueAsNumber;
    if (currentValueIndicator) currentValueIndicator.textContent = value.toString();
    aizawaMultiplier = value;
  },
});
const thomasInput = createInput({
  ...ATTRACTOR_DEFAULTS,
  label: 'Thomas',
  initialValue: thomasMultiplier,
  oninput: (e, currentValueIndicator) => {
    const value = (e.target as HTMLInputElement).valueAsNumber;
    if (currentValueIndicator) currentValueIndicator.textContent = value.toString();
    thomasMultiplier = value;
  },
});
const lorenzMod2Input = createInput({
  ...ATTRACTOR_DEFAULTS,
  label: 'Lorenz Mod 2',
  initialValue: lorenzMod2Multiplier,
  oninput: (e, currentValueIndicator) => {
    const value = (e.target as HTMLInputElement).valueAsNumber;
    if (currentValueIndicator) currentValueIndicator.textContent = value.toString();
    lorenzMod2Multiplier = value;
  },
});
const hadleyInput = createInput({
  ...ATTRACTOR_DEFAULTS,
  label: 'Hadley',
  initialValue: hadleyMultiplier,
  oninput: (e, currentValueIndicator) => {
    const value = (e.target as HTMLInputElement).valueAsNumber;
    if (currentValueIndicator) currentValueIndicator.textContent = value.toString();
    hadleyMultiplier = value;
  },
});
const halvorsenInput = createInput({
  ...ATTRACTOR_DEFAULTS,
  label: 'Halvorsen',
  initialValue: halvorsenMultiplier,
  oninput: (e, currentValueIndicator) => {
    const value = (e.target as HTMLInputElement).valueAsNumber;
    if (currentValueIndicator) currentValueIndicator.textContent = value.toString();
    halvorsenMultiplier = value;
  },
});
const threeScrollInput = createInput({
  ...ATTRACTOR_DEFAULTS,
  label: 'Three-Scroll Unified Chaotic System',
  initialValue: threeScrollMultiplier,
  oninput: (e, currentValueIndicator) => {
    const value = (e.target as HTMLInputElement).valueAsNumber;
    if (currentValueIndicator) currentValueIndicator.textContent = value.toString();
    threeScrollMultiplier = value;
  },
});
const coulletInput = createInput({
  ...ATTRACTOR_DEFAULTS,
  label: 'Coullet',
  initialValue: coulletMultiplier,
  oninput: (e, currentValueIndicator) => {
    const value = (e.target as HTMLInputElement).valueAsNumber;
    if (currentValueIndicator) currentValueIndicator.textContent = value.toString();
    coulletMultiplier = value;
  },
});
const dadrasInput = createInput({
  ...ATTRACTOR_DEFAULTS,
  label: 'Dadras',
  initialValue: dadrasMultiplier,
  oninput: (e, currentValueIndicator) => {
    const value = (e.target as HTMLInputElement).valueAsNumber;
    if (currentValueIndicator) currentValueIndicator.textContent = value.toString();
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

const resetStateValues = () => {
  rotateX = INITIAL_VALUES.rotateX;
  rotateY = INITIAL_VALUES.rotateY;
  rotateZ = INITIAL_VALUES.rotateZ;
  translateZ = INITIAL_VALUES.translateZ;
  speed = INITIAL_VALUES.speed;
  lorenzMultiplier = INITIAL_VALUES.lorenzMultiplier;
  arneodoMultiplier = INITIAL_VALUES.arneodoMultiplier;
  burkeShawMultiplier = INITIAL_VALUES.burkeShawMultiplier;
  chenLeeMultiplier = INITIAL_VALUES.chenLeeMultiplier;
  aizawaMultiplier = INITIAL_VALUES.aizawaMultiplier;
  thomasMultiplier = INITIAL_VALUES.thomasMultiplier;
  lorenzMod2Multiplier = INITIAL_VALUES.lorenzMod2Multiplier;
  hadleyMultiplier = INITIAL_VALUES.hadleyMultiplier;
  halvorsenMultiplier = INITIAL_VALUES.halvorsenMultiplier;
  threeScrollMultiplier = INITIAL_VALUES.threeScrollMultiplier;
  coulletMultiplier = INITIAL_VALUES.coulletMultiplier;
  dadrasMultiplier = INITIAL_VALUES.dadrasMultiplier;
}

const resetGui = () => {
  // update input values
  speedInput.querySelector('input')!.value = INITIAL_VALUES.speed.toString();
  lorenzInput.querySelector('input')!.value = INITIAL_VALUES.lorenzMultiplier.toString();
  arneodoInput.querySelector('input')!.value = INITIAL_VALUES.arneodoMultiplier.toString();
  burkeShawInput.querySelector('input')!.value = INITIAL_VALUES.burkeShawMultiplier.toString();
  chenLeeInput.querySelector('input')!.value = INITIAL_VALUES.chenLeeMultiplier.toString();
  aizawaInput.querySelector('input')!.value = INITIAL_VALUES.aizawaMultiplier.toString();
  thomasInput.querySelector('input')!.value = INITIAL_VALUES.thomasMultiplier.toString();
  lorenzMod2Input.querySelector('input')!.value = INITIAL_VALUES.lorenzMod2Multiplier.toString();
  hadleyInput.querySelector('input')!.value = INITIAL_VALUES.hadleyMultiplier.toString();
  halvorsenInput.querySelector('input')!.value = INITIAL_VALUES.halvorsenMultiplier.toString();
  threeScrollInput.querySelector('input')!.value = INITIAL_VALUES.threeScrollMultiplier.toString();
  coulletInput.querySelector('input')!.value = INITIAL_VALUES.coulletMultiplier.toString();
  dadrasInput.querySelector('input')!.value = INITIAL_VALUES.dadrasMultiplier.toString();

  // update input label values
  speedInput.querySelector('p')!.textContent = INITIAL_VALUES.speed.toString();
  lorenzInput.querySelector('p')!.textContent = INITIAL_VALUES.lorenzMultiplier.toString();
  arneodoInput.querySelector('p')!.textContent = INITIAL_VALUES.arneodoMultiplier.toString();
  burkeShawInput.querySelector('p')!.textContent = INITIAL_VALUES.burkeShawMultiplier.toString();
  chenLeeInput.querySelector('p')!.textContent = INITIAL_VALUES.chenLeeMultiplier.toString();
  aizawaInput.querySelector('p')!.textContent = INITIAL_VALUES.aizawaMultiplier.toString();
  thomasInput.querySelector('p')!.textContent = INITIAL_VALUES.thomasMultiplier.toString();
  lorenzMod2Input.querySelector('p')!.textContent = INITIAL_VALUES.lorenzMod2Multiplier.toString();
  hadleyInput.querySelector('p')!.textContent = INITIAL_VALUES.hadleyMultiplier.toString();
  halvorsenInput.querySelector('p')!.textContent = INITIAL_VALUES.halvorsenMultiplier.toString();
  threeScrollInput.querySelector('p')!.textContent = INITIAL_VALUES.threeScrollMultiplier.toString();
  coulletInput.querySelector('p')!.textContent = INITIAL_VALUES.coulletMultiplier.toString();
  dadrasInput.querySelector('p')!.textContent = INITIAL_VALUES.dadrasMultiplier.toString();
}

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
  gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
  if (!gl) throw err('WebGL not supported', { gl });

  resetStateValues();
  resetGui();
  addEventListeners();

  // create initial particle positions
  initialParticlePositions = new Float32Array(Array.from({ length: NUM_POINTS * 3 }, () => {
    return (2 * Math.random() - 1);
  }));

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

  // use forEach for extensibility later
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

  // use forEach for extensibility later
  [positionVboRead].forEach((vbo, i) => {
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

const resetParticles = () => {
  // reset particles (re-upload original vertex data)
  positionVboRead = createVbo(gl, initialParticlePositions, gl.DYNAMIC_COPY);
}

const resetEverything = () => {
  resetParticles();
  resetStateValues();
  resetGui();
  updateProjectionMatrix();
}

const animate = () => {
  render();
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

  resetParticlesButton.onclick = resetParticles;
  resetEverythingButton.onclick = resetEverything;

  // take screenshot on click
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  const saveBlob = (blob: Blob | null, fileName: string) => {
    if (!blob) return;
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
  };
  saveImageButton.onclick = () => {
    render();
    canvas.toBlob((blob) => {
      saveBlob(blob, `particles.png`);
    });
  }
}


main();