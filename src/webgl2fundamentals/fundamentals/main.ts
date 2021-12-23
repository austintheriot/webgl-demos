import { createProgram, createShader, err, resizeCanvasToDisplaySize } from "../utils";

const runFundamentals = async () => {
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

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);




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

  // must set this uniform after program is in use?
  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');

  const colorUniformLocation = gl.getUniformLocation(program, 'burke_shaw_multiplierolor');

  for (let i = 0; i < 100; i++) {
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

    const Ax = Math.floor(Math.random() * (canvas.width / 2));
    const Ay = Math.floor(Math.random() * (canvas.height / 2));

    const width = Math.floor(Math.random() * (canvas.width / 2));
    const height = Math.floor(Math.random() * (canvas.height / 2));

    const Bx = Ax + width;
    const By = Ay;

    const Cx = Ax + width;
    const Cy = Ay + height;

    const Dx = Ax;
    const Dy = Ay + height;

    // three 2d points
    const positions = [
      // triangle 0
      Cx, Cy,
      Bx, By,
      Dx, Dy,

      // triangle 1
      Bx, By,
      Dx, Dy,
      Ax, Ay,
    ];

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // copy javascript data into WebGL buffer
    // STATIC_DRAW hints to WebGL that this won't change much
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // draw
    const primitiveType = gl.TRIANGLES; // draws a triangle after shader is run every 3 times
    const offset = 0;
    const count = 6; // this will execute vertex shader 3 times
    gl.drawArrays(primitiveType, offset, count);
  }
};

runFundamentals();