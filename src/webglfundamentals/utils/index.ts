export const err = <D extends Record<string, unknown>>(msg: string, data: D) => {
  console.error(msg, data);
  return new Error(msg);
}

/** compiles a shader from source code and returns it if successful */
export const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) throw err('error creating shader', { shader });
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) return shader;
  const error = gl.getShaderInfoLog(shader) || 'Failed to create shader';
  gl.deleteShader(shader);
  throw new Error(error);
}

export const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
  const program = gl.createProgram();
  if (!program) throw err('error creating program', { program });
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) return program;
  const error = gl.getProgramInfoLog(program) || 'Failed to create program';
  gl.deleteProgram(program);
  throw new Error(error);
}

export const resizeCanvasToDisplaySize = (canvas: HTMLCanvasElement) => {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const canvasElWidth = canvas.clientWidth;
  const canvasElHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize = canvas.width !== canvasElWidth || canvas.height !== canvasElHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width = canvasElWidth;
    canvas.height = canvasElHeight;
  }

  return needResize;
}

/** 3x3 matrix */
export type Matrix3x3 = [number, number, number, number, number, number, number, number, number];

/** 3x3 matrix utilities (for transforming 2D coordinates) */
export const matrix3x3 = {
  /** Generate 3x3 identity matrix */
  createIdentityMatrix: (): Matrix3x3 => [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
  ],

  /** Generate 3x3 translation matrix */
  createTranslationMatrix: function (tx: number, ty: number): Matrix3x3 {
    return [
      1, 0, 0,
      0, 1, 0,
      tx, ty, 1,
    ];
  },

  /** Generate 3x3 rotation matrix */
  createRotationMatrix: function (angleInRadians: number): Matrix3x3 {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
      c, -s, 0,
      s, c, 0,
      0, 0, 1,
    ];
  },

  /** Generate 3x3 scaling matrix */
  createScalingMatrix: function (sx: number, sy: number): Matrix3x3 {
    return [
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1,
    ];
  },

  /** Multiply two 3x3 matrixes together */
  multiply: function (a: Matrix3x3, b: Matrix3x3): Matrix3x3 {
    const MATRIX_SIZE = 3;
    // matrix coordinates
    var a00 = a[0 * MATRIX_SIZE + 0];
    var a01 = a[0 * MATRIX_SIZE + 1];
    var a02 = a[0 * MATRIX_SIZE + 2];
    var a10 = a[1 * MATRIX_SIZE + 0];
    var a11 = a[1 * MATRIX_SIZE + 1];
    var a12 = a[1 * MATRIX_SIZE + 2];
    var a20 = a[2 * MATRIX_SIZE + 0];
    var a21 = a[2 * MATRIX_SIZE + 1];
    var a22 = a[2 * MATRIX_SIZE + 2];
    var b00 = b[0 * MATRIX_SIZE + 0];
    var b01 = b[0 * MATRIX_SIZE + 1];
    var b02 = b[0 * MATRIX_SIZE + 2];
    var b10 = b[1 * MATRIX_SIZE + 0];
    var b11 = b[1 * MATRIX_SIZE + 1];
    var b12 = b[1 * MATRIX_SIZE + 2];
    var b20 = b[2 * MATRIX_SIZE + 0];
    var b21 = b[2 * MATRIX_SIZE + 1];
    var b22 = b[2 * MATRIX_SIZE + 2];

    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,

      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,

      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },

  translate: (m: Matrix3x3, tx: number, ty: number) => {
    return matrix3x3.multiply(m, matrix3x3.createTranslationMatrix(tx, ty));
  },

  scale: (m: Matrix3x3, sx: number, sy: number) => {
    return matrix3x3.multiply(m, matrix3x3.createScalingMatrix(sx, sy));
  },

  rotate: (m: Matrix3x3, angleInRadians: number) => {
    return matrix3x3.multiply(m, matrix3x3.createRotationMatrix(angleInRadians));
  },
}