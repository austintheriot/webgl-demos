const err = <D extends Record<string, unknown>>(msg: string, data: D) => {
  console.error(msg, data);
  return new Error(msg);
}

/** compiles a shader from source code and returns it if successful */
const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) throw err('error creating shader', { shader });
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) return shader;

  // if fail:
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
  const program = gl.createProgram();
  if (!program) throw err('error creating program', { program });
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) return program;

  // if fail:
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
}

const resizeCanvasToDisplaySize = (canvas: HTMLCanvasElement) => {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const canvasElWidth  = canvas.clientWidth;
  const canvasElHeight = canvas.clientHeight;
 
  // Check if the canvas is not the same size.
  const needResize = canvas.width  !== canvasElWidth || canvas.height !== canvasElHeight;
 
  if (needResize) {
    // Make the canvas the same size
    canvas.width  = canvasElWidth;
    canvas.height = canvasElHeight;
  }
 
  return needResize;
}

const main = async () => {
  const canvas = document.querySelector('canvas');
  if (!canvas) throw err('canvas not found', { canvas });
  const gl = canvas.getContext('webgl2');
  if (!gl) throw err('WebGL not supported', { gl });

  const WIDTH = 900;
  const HEIGHT = 900;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const [vertexShaderSource, fragmentShaderSource] = await Promise.all([
    fetch('./vertex.glsl'),
    fetch('./fragment.glsl'),
  ]).then(([vertex, fragment]) => Promise.all([
    vertex.text(),
    fragment.text()
  ]));

  // create shaders from source code
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vertexShader || !fragmentShader) throw err('error creating vertex and/or fragment shaders', { vertexShader, fragmentShader });

  // link shaders to a WebGL program
  const program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) throw err('error creating gl program', { program });

  // look up where the vertex data needs to go.
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

  // Create a buffer and put three 2d clip space points in it
  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) throw err('error creating position buffer', { positionBuffer });

  // three 2d points
  const positions = [
    0, 0,
    0, 0.5,
    0.5, 0,
  ];

  // Bind it to ARRAY_BUFFER (think of it as the global variable ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // copy javascript data into WebGL buffer
  // STATIC_DRAW hints to WebGL that this won't change much
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const vertexArrayObject = gl.createVertexArray();
  if (!vertexArrayObject) throw err('error creating vertex array object', { vao: vertexArrayObject });
  gl.bindVertexArray(vertexArrayObject);

  // turn on the a_position attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  const size = 2;          // 2 components per iteration - get first 2 values from buffer, then next 2, etc.
  const type = gl.FLOAT;   // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  const positionBufferOffset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, positionBufferOffset)

  resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);
  gl.bindVertexArray(vertexArrayObject)

  // draw
  const primitiveType = gl.TRIANGLES; // draws a triangle after shader is run every 3 times
  const offset = 0;
  const count = 3; // this will execute vertex shader 3 times
  gl.drawArrays(primitiveType, offset, count);
};

main();