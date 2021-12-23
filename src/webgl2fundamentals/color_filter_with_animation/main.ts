import { createProgram, createShader, err } from "../utils";

const init = async (image: HTMLImageElement): Promise<WebGL2RenderingContext> => {
  // INITIALIZATION / BOILERPLATE ////////////////////////////////////////////////////////////////////////////////////////////
  const canvas = document.querySelector('canvas');
  if (!canvas) throw err('canvas not found', { canvas });
  const gl = canvas.getContext('webgl2');
  if (!gl) throw err('WebGL not supported', { gl });

  // sync canvas size with image size
  canvas.width = image.width;
  canvas.height = image.height;

  const [vertexShaderSource, fragmentShaderSource] = await Promise.all([
    fetch('./vertex.glsl'),
    fetch('./fragment.glsl'),
  ]).then(([vertex, fragment]) => Promise.all([
    vertex.text(),
    fragment.text(),
  ]));

  // create shaders from source code
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)!;
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)!;

  // link shaders to a WebGL program
  const program = createProgram(gl, vertexShader, fragmentShader)!;
  gl.useProgram(program);

  // create VAO
  const vertexArrayObject = gl.createVertexArray()!;
  gl.bindVertexArray(vertexArrayObject);

  // get positions of attributes and uniforms
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  const texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");
  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
  const imageUniformLocation = gl.getUniformLocation(program, "halvorsen_multipliermage");

  // POSITION BUFFER ////////////////////////////////////////////////////////////////////////////////////////////
  const positionBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Make a rectangle the same size as the image.
  const x1 = 0;
  const x2 = image.width;
  const y1 = 0;
  const y2 = image.height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,

    x1, y2,
    x2, y1,
    x2, y2,
  ]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation);
  // configure how the a_position attribute should pull data from the position buffer
  const positionSize = 2;          // get positions in x, y pairs for 2d image
  const positionType = gl.FLOAT;   // the data is 32bit floats
  const positionNormalize = false; // don't normalize the data
  const positionStride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  const positionBufferOffset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(positionAttributeLocation, positionSize, positionType, positionNormalize, positionStride, positionBufferOffset)

  // TEXTURE COORDINATE BUFFER ////////////////////////////////////////////////////////////////////////////////////////////
  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,

    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(texCoordAttributeLocation);
  // configure how the a_texCoord attribute should pull data from the texture coodinate buffer
  const texSize = 2;          // 2 components per iteration - an (x, y) texture coordinate for every vertex
  const textype = gl.FLOAT;   // the data is 32bit floats
  const texNormalize = false; // don't normalize the data
  const texStride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  const texOffset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(texCoordAttributeLocation, texSize, textype, texNormalize, texStride, texOffset)

  // CREATE TEXTURE ////////////////////////////////////////////////////////////////////////////////////////////
  const texture = gl.createTexture();

  // make unit 0 the active texture unit
  // (i.e, the unit all other texture commands will affect.)
  gl.activeTexture(gl.TEXTURE0 + 0);

  // Bind texture to 'texture unit '0' 2D bind point
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the parameters so we don't need mips and so we're not filtering
  // and we don't repeat
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Upload the image into the texture.
  const mipLevel = 0;               // the largest mip
  const internalFormat = gl.RGBA;   // format we want in the texture
  const srcFormat = gl.RGBA;        // format of data we are supplying
  const srcType = gl.UNSIGNED_BYTE  // type of data we are supplying
  gl.texImage2D(gl.TEXTURE_2D, mipLevel, internalFormat, srcFormat, srcType, image);


  // UNIFORMS ////////////////////////////////////////////////////////////////////////////////////////////
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  // Tell the fragment shader to get the halvorsen_multipliermage texture from texture unit 0
  gl.uniform1i(imageUniformLocation, 0);

  return gl;
};

const render = (gl: WebGL2RenderingContext) => {
  // RENDERING ////////////////////////////////////////////////////////////////////////////////////////////
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // clear canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // draw
  const primitiveType = gl.TRIANGLES; // draws a triangle after shader is run every 3 times
  const offset = 0;
  const count = 6; // this will execute vertex shader 3 times
  gl.drawArrays(primitiveType, offset, count);

  requestAnimationFrame(() => render(gl));
};

const runImageProcessing = () => {
  const image = new Image();
  image.src = './city.jpg';

  // render image on canvas once data has been fetched
  image.onload = async () => {
    const gl = await init(image);
    requestAnimationFrame(() => render(gl));
  };
}

runImageProcessing();